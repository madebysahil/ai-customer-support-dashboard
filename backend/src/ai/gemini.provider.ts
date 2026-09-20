import { GoogleGenerativeAI, ChatSession, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { IAiProvider, AiMessage, AiResponse, AiResponseMetadata } from './provider.interface';
import { env } from '../config/env';

export class GeminiProvider implements IAiProvider {
  private genAI: GoogleGenerativeAI;
  private defaultModel = 'gemini-3.5-flash';
  private promptVersion = 'v1.0.0';

  constructor() {
    // If API key is missing, it will throw. In production, ensure env is strictly validated.
    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || 'MISSING_KEY');
  }

  private mapMessagesToGeminiFormat(messages: AiMessage[]) {
    // Gemini expects a strict alternating format or system instruction context
    let systemInstruction = '';
    const history: { role: string; parts: { text: string }[] }[] = [];

    messages.forEach((msg) => {
      if (msg.role === 'system') {
        systemInstruction += msg.content + '\n';
      } else {
        history.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        });
      }
    });

    return { systemInstruction, history };
  }

  async generateResponse(
    messages: AiMessage[],
    options?: { temperature?: number; topP?: number; maxTokens?: number }
  ): Promise<AiResponse> {
    const { systemInstruction, history } = this.mapMessagesToGeminiFormat(messages);
    
    // Extract the latest user message to send as the actual trigger
    const latestMessage = history.pop();
    if (!latestMessage) throw new Error('No user message provided to Gemini');

    const modelConfig = {
      model: this.defaultModel,
      generationConfig: {
        temperature: options?.temperature ?? 0.2, // Low for consistency
        topP: options?.topP ?? 0.8,
        maxOutputTokens: options?.maxTokens ?? 1024,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    };

    const model = this.genAI.getGenerativeModel(modelConfig);

    // Initialize chat session
    const chat: ChatSession = model.startChat({
      history,
      // System instructions for gemini-pro (may require specific beta API/models for explicit system param, mimicking here via history if needed)
    });

    // We simulate injecting the system instruction into the history if native support is not active
    if (systemInstruction && history.length === 0) {
       history.push({ role: 'user', parts: [{ text: `SYSTEM DIRECTIVE: ${systemInstruction}` }] });
       history.push({ role: 'model', parts: [{ text: `Understood.` }] });
    }

    try {
      const result = await chat.sendMessage(latestMessage.parts[0].text);
      const response = await result.response;
      
      const text = response.text();

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

      // Rough token estimation if native usage metadata is absent in standard gemini-pro SDK return
      const promptTokens = (systemInstruction.length + history.reduce((acc, h) => acc + h.parts[0].text.length, 0)) / 4;
      const completionTokens = text.length / 4;

      return {
        text,
        metadata: {
          provider: 'google-gemini',
          model: this.defaultModel,
          promptVersion: this.promptVersion,
          tokensUsed: {
            prompt: Math.round(promptTokens),
            completion: Math.round(completionTokens),
            total: Math.round(promptTokens + completionTokens),
          },
          confidenceScore: calculatedConfidence,
        }
      };
    } catch (error: any) {
      throw new Error(`Gemini API Error: ${error.message}`);
    }
  }

  async generateStream(
    messages: AiMessage[],
    onChunk: (chunk: string) => void,
    options?: { temperature?: number; topP?: number; maxTokens?: number }
  ): Promise<AiResponseMetadata> {
    const { systemInstruction, history } = this.mapMessagesToGeminiFormat(messages);
    const latestMessage = history.pop();
    if (!latestMessage) throw new Error('No user message provided to Gemini');

    if (systemInstruction && history.length === 0) {
       history.push({ role: 'user', parts: [{ text: `SYSTEM DIRECTIVE: ${systemInstruction}` }] });
       history.push({ role: 'model', parts: [{ text: `Understood.` }] });
    }

    const model = this.genAI.getGenerativeModel({ model: this.defaultModel });
    const chat = model.startChat({ history });

    const result = await chat.sendMessageStream(latestMessage.parts[0].text);
    
    
    let fullText = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      onChunk(chunkText);
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
      provider: 'google-gemini',
      model: this.defaultModel,
      promptVersion: this.promptVersion,
      tokensUsed: { prompt: 0, completion: 0, total: 0 }, // Estimation logic omitted for brevity
      confidenceScore: calculatedConfidence,
    };
  }
}

export const geminiProvider = new GeminiProvider();
