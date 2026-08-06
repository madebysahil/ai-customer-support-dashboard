export interface AiMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}

export interface AiResponseMetadata {
  provider: string;
  model: string;
  promptVersion: string;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  confidenceScore: number;
  citations?: { documentId: string; chunkId: string; contentSnippet: string; score: number }[];
}

export interface AiResponse {
  text: string;
  metadata: AiResponseMetadata;
}

export interface IAiProvider {
  /**
   * Standard block response generation
   */
  generateResponse(
    messages: AiMessage[],
    options?: { temperature?: number; topP?: number; maxTokens?: number }
  ): Promise<AiResponse>;

  /**
   * Streaming response generation (future-proof)
   */
  generateStream(
    messages: AiMessage[],
    onChunk: (chunk: string) => void,
    options?: { temperature?: number; topP?: number; maxTokens?: number }
  ): Promise<AiResponseMetadata>;
}
