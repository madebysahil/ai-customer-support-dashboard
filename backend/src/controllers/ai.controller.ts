import { Request, Response, NextFunction } from 'express';
import { geminiProvider } from '../ai/gemini.provider';
import { PromptBuilder } from '../ai/prompt.builder';
import { AiMessage } from '../ai/provider.interface';
import { logger } from '../utils/logger';

export class AiController {
  async stream(req: Request, res: Response, next: NextFunction) {
    try {
      const { messages, context, maxTokens, temperature } = req.body as { 
        messages: AiMessage[], 
        context?: { customerId?: string, ticketId?: string, query?: string },
        maxTokens?: number,
        temperature?: number
      };

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      let ragContextString = '';
      let citations: any[] = [];
      const startTime = Date.now();

      // Retrieve knowledge context if query is provided
      if (context?.query) {
        try {
          const { retrievalService } = require('../services/kb/retrieval.service');
          const retrievedChunks = await retrievalService.search(context.query);
          if (retrievedChunks.length > 0) {
            ragContextString = "COMPANY KNOWLEDGE BASE CONTEXT:\n" + retrievedChunks.map((c: any, i: number) => `[Source ${i+1}]: ${c.content}`).join("\n\n");
            citations = retrievedChunks.map((c: any) => ({
              documentId: c.documentId,
              chunkId: c.id,
              contentSnippet: c.content.substring(0, 50) + '...',
              score: c.score
            }));
          }
        } catch (err: any) {
          logger.warn(`Failed to retrieve knowledge context: ${err.message}`);
        }
      }

      // Inject system prompt with RAG context at the beginning
      const systemMessage: AiMessage = {
        role: 'system',
        content: `You are an expert AI Copilot assisting customer support agents.
Your goal is to help them resolve issues, draft responses, and analyze data efficiently.
Always be professional, concise, and accurate.
Use markdown for formatting.
${ragContextString}`
      };

      const fullMessages = [systemMessage, ...messages];

      const metadata = await geminiProvider.generateStream(
        fullMessages,
        (chunk: string) => {
          // SSE format
          res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        },
        { maxTokens, temperature }
      );

      const latency = Date.now() - startTime;

      if (citations.length > 0) {
        metadata.citations = citations;
      }

      // Send final metadata event
      res.write(`data: ${JSON.stringify({ metadata: { ...metadata, latency } })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      res.end();

    } catch (error: any) {
      logger.error('AI Stream Error', { error: error.message });
      if (!res.headersSent) {
        next(error);
      } else {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      }
    }
  }
}

export const aiController = new AiController();
