import { IAiProvider } from '../../ai/provider.interface';
import { geminiProvider } from '../../ai/gemini.provider';
import { PromptBuilder } from '../../ai/prompt.builder';
import { ContextBuilder } from '../../ai/context.builder';
import { messageService } from '../message.service';
import { chatRepository } from '../../repositories/chat.repository';
import { messageRepository } from '../../repositories/message.repository';
import { Server } from 'socket.io';
import { logger } from '../../utils/logger';

export type AiProcessingState = 'IDLE' | 'THINKING' | 'RESPONDING' | 'FAILED' | 'ESCALATED';

export class AiOrchestrator {
  private provider: IAiProvider;

  constructor(provider: IAiProvider = geminiProvider) {
    this.provider = provider;
  }

  private broadcastState(io: Server, chatId: string, state: AiProcessingState) {
    io.to(`chat_${chatId}`).emit('ai:state.update', { chatId, state });
  }

  async handleCustomerMessage(io: Server, chatId: string, messageContent: string) {
    const chat = await chatRepository.findById(chatId);
    if (!chat || chat.status !== 'AI_HANDLED') return;

    this.broadcastState(io, chatId, 'THINKING');

    try {
      const messages = await messageRepository.findMany({ where: { chatId }, orderBy: { createdAt: 'desc' }, take: 10 });
      const history = ContextBuilder.buildHistory(messages);
      
      // RAG Retrieval
      const { retrievalService } = require('../kb/retrieval.service');
      const retrievedChunks = await retrievalService.search(messageContent);
      
      let ragContextString = '';
      let citations = [];
      if (retrievedChunks.length > 0) {
        ragContextString = "COMPANY KNOWLEDGE BASE CONTEXT:\n" + retrievedChunks.map((c: any, i: number) => `[Source ${i+1}]: ${c.content}`).join("\n\n");
        citations = retrievedChunks.map((c: any) => ({
          documentId: c.documentId,
          chunkId: c.id,
          contentSnippet: c.content.substring(0, 50) + '...',
          score: c.score
        }));
      }
      
      const prompt = PromptBuilder.buildSupportPrompt(
        { name: 'Customer', knowledgeContext: ragContextString }, 
        messageContent
      );
      
      // Merge history and prompt
      const fullContext = [...history, ...prompt];

      this.broadcastState(io, chatId, 'RESPONDING');
      
      const { metricsCollector } = require('../../analytics/metrics.collector');
      const { AnalyticsEvents } = require('../../analytics/events.constants');

      metricsCollector.record({
        eventType: AnalyticsEvents.AI_REQUEST,
        dimensions: { chatId, origin: chat.channelOrigin }
      });

      const response = await this.provider.generateResponse(fullContext);
      
      metricsCollector.record({
        eventType: AnalyticsEvents.AI_RESPONSE,
        metricVal: response.metadata.confidenceScore,
        dimensions: { 
          chatId, 
          model: response.metadata.model,
          promptTokens: response.metadata.tokensUsed.prompt,
          completionTokens: response.metadata.tokensUsed.completion
        }
      });
      
      // Append citations to metadata
      if (citations.length > 0) {
        response.metadata.citations = citations;
      }

      // Check for implicit escalation
      if (response.metadata.confidenceScore < 0.6 || response.text.toLowerCase().includes('escalating')) {
        this.broadcastState(io, chatId, 'ESCALATED');
        await chatRepository.update(chatId, { status: 'QUEUED' }); // Pass to human list
        
        metricsCollector.record({
          eventType: AnalyticsEvents.AI_ESCALATION,
          dimensions: { chatId, reason: 'low_confidence' }
        });

        // Batch 7 Integration: Generate an escalation ticket automatically
        const { ticketEscalationService } = require('../../services/ticket.escalation.service');
        await ticketEscalationService.escalateChatToTicket(chatId);
        
        return;
      }

      // Save AI Message with metadata
      const aiMessage = await messageRepository.create({
        chatId,
        authorId: 'system_ai',
        content: response.text,
        authorType: 'AI_ASSISTANT',
        metadata: response.metadata as any,
      });

      // Broadcast
      io.to(`chat_${chatId}`).emit('chat:message.receive', aiMessage);
      this.broadcastState(io, chatId, 'IDLE');

    } catch (error: any) {
      logger.error('AI Orchestration Error', { error: error.message });
      this.broadcastState(io, chatId, 'FAILED');
    }
  }

  async generateSuggestedReplies(chatId: string): Promise<string[]> {
    try {
      const messages = await messageRepository.findMany({ where: { chatId }, orderBy: { createdAt: 'desc' }, take: 5 });
      const contextString = ContextBuilder.formatForSuggestions(messages);
      
      const prompt = PromptBuilder.buildSuggestionsPrompt(contextString);
      const response = await this.provider.generateResponse(prompt, { temperature: 0.7 });
      
      // Parse JSON array
      const suggestions = JSON.parse(response.text);
      return Array.isArray(suggestions) ? suggestions : [];
    } catch (e) {
      logger.warn('Failed to generate suggested replies');
      return [];
    }
  }
}

export const aiOrchestrator = new AiOrchestrator();
