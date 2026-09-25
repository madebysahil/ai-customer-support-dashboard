import { IAiProvider, AiMessage, AiResponse, AiResponseMetadata } from './provider.interface';
import { env } from '../config/env';

export class OpenRouterProvider implements IAiProvider {
  private apiKey: string;
  private defaultModel: string = 'openrouter/free';
  private promptVersion = 'v1.0.0';

  constructor() {
    this.apiKey = (env as any).OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OPENROUTER_API_KEY is missing from environment variables');
    }
  }

  private mapMessagesToOpenRouterFormat(messages: AiMessage[]) {
    return messages.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : msg.role,
      content: msg.content
    }));
  }

  async generateResponse(
    messages: AiMessage[],
    options?: { temperature?: number; topP?: number; maxTokens?: number }
  ): Promise<AiResponse> {
    const formattedMessages = this.mapMessagesToOpenRouterFormat(messages);

    const body = {
      model: this.defaultModel,
      messages: formattedMessages,
      temperature: options?.temperature ?? 0.2,
      top_p: options?.topP ?? 0.8,
      max_tokens: options?.maxTokens ?? 1024,
    };

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter API Error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';

      // Simple heuristic for confidence score
      let calculatedConfidence = 0.95;
      const lowerText = text.toLowerCase();
      if (lowerText.includes("i'm not sure") || lowerText.includes("i don't know") || lowerText.includes("could you clarify")) {
        calculatedConfidence -= 0.4;
      }
      if (text.length < 20) {
        calculatedConfidence -= 0.2;
      }
      if (lowerText.includes("escalat") || lowerText.includes("human agent")) {
        calculatedConfidence -= 0.3;
      }
      calculatedConfidence = Math.max(0.1, Math.min(0.99, calculatedConfidence));

      const promptTokens = data.usage?.prompt_tokens ?? 0;
      const completionTokens = data.usage?.completion_tokens ?? 0;

      return {
        text,
        metadata: {
          provider: 'openrouter',
          model: this.defaultModel,
          promptVersion: this.promptVersion,
          tokensUsed: {
            prompt: promptTokens,
            completion: completionTokens,
            total: promptTokens + completionTokens,
          },
          confidenceScore: calculatedConfidence,
        }
      };
    } catch (error: any) {
      throw new Error(`OpenRouter Provider Error: ${error.message}`);
    }
  }

  async generateStream(
    messages: AiMessage[],
    onChunk: (chunk: string) => void,
    options?: { temperature?: number; topP?: number; maxTokens?: number }
  ): Promise<AiResponseMetadata> {
    const formattedMessages = this.mapMessagesToOpenRouterFormat(messages);

    const body = {
      model: this.defaultModel,
      messages: formattedMessages,
      temperature: options?.temperature ?? 0.2,
      top_p: options?.topP ?? 0.8,
      max_tokens: options?.maxTokens ?? 1024,
      stream: true,
    };

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter API Error (${response.status}): ${errText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader for streaming');
      }

      const decoder = new TextDecoder('utf-8');
      let fullText = '';
      let buffer = '';

      let promptTokens = 0;
      let completionTokens = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last partial line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || trimmedLine.startsWith(':')) continue;

          if (trimmedLine === 'data: [DONE]') {
            continue;
          }

          if (trimmedLine.startsWith('data: ')) {
            const dataStr = trimmedLine.slice(6);
            try {
              const parsed = JSON.parse(dataStr);
              const contentChunk = parsed.choices?.[0]?.delta?.content;
              if (contentChunk) {
                fullText += contentChunk;
                onChunk(contentChunk);
              }
              if (parsed.usage) {
                promptTokens = parsed.usage.prompt_tokens ?? promptTokens;
                completionTokens = parsed.usage.completion_tokens ?? completionTokens;
              }
            } catch (e) {
              // Ignore invalid JSON chunks
              console.warn('Failed to parse stream chunk:', dataStr);
            }
          }
        }
      }

      if (buffer.trim()) {
        const trimmedLine = buffer.trim();
        if (trimmedLine.startsWith('data: ') && trimmedLine !== 'data: [DONE]') {
          try {
            const dataStr = trimmedLine.slice(6);
            const parsed = JSON.parse(dataStr);
            const contentChunk = parsed.choices?.[0]?.delta?.content;
            if (contentChunk) {
              fullText += contentChunk;
              onChunk(contentChunk);
            }
            if (parsed.usage) {
              promptTokens = parsed.usage.prompt_tokens ?? promptTokens;
              completionTokens = parsed.usage.completion_tokens ?? completionTokens;
            }
          } catch (e) {
            console.warn('Failed to parse final stream chunk:', trimmedLine.slice(6));
          }
        }
      }

      let calculatedConfidence = 0.95;
      const lowerText = fullText.toLowerCase();
      if (lowerText.includes("i'm not sure") || lowerText.includes("i don't know") || lowerText.includes("could you clarify")) {
        calculatedConfidence -= 0.4;
      }
      if (fullText.length < 20) {
        calculatedConfidence -= 0.2;
      }
      if (lowerText.includes("escalat") || lowerText.includes("human agent")) {
        calculatedConfidence -= 0.3;
      }
      calculatedConfidence = Math.max(0.1, Math.min(0.99, calculatedConfidence));

      return {
        provider: 'openrouter',
        model: this.defaultModel,
        promptVersion: this.promptVersion,
        tokensUsed: { prompt: promptTokens, completion: completionTokens, total: promptTokens + completionTokens },
        confidenceScore: calculatedConfidence,
      };
    } catch (error: any) {
      throw new Error(`OpenRouter Provider Error: ${error.message}`);
    }
  }
}

export const openrouterProvider = new OpenRouterProvider();
