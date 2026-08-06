import { GoogleGenerativeAI } from '@google/generative-ai';
import { IEmbeddingProvider } from './embedding.interface';
import { env } from '../../config/env';

export class GoogleEmbeddingProvider implements IEmbeddingProvider {
  private genAI: GoogleGenerativeAI;
  private modelName = 'text-embedding-004'; // Latest default for text tasks
  private version = 'v1';

  constructor() {
    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || 'MISSING');
  }

  async embedChunks(chunks: string[]): Promise<number[][]> {
    const model = this.genAI.getGenerativeModel({ model: this.modelName });
    // Batch embeddings are generally supported via specific REST calls or mapping. 
    // The Node SDK might require mapping over chunks for simplicity if batch isn't natively exposed.
    const promises = chunks.map(chunk => model.embedContent(chunk));
    const results = await Promise.all(promises);
    
    return results.map(r => r.embedding.values);
  }

  async embedQuery(query: string): Promise<number[]> {
    const model = this.genAI.getGenerativeModel({ model: this.modelName });
    const result = await model.embedContent(query);
    return result.embedding.values;
  }

  getModelName(): string {
    return this.modelName;
  }

  getVersion(): string {
    return this.version;
  }
}

export const googleEmbeddingProvider = new GoogleEmbeddingProvider();
