import { googleEmbeddingProvider } from '../../ai/embeddings/google.embedding';
import { pgVectorStore } from '../../ai/vector/pgvector.store';
import { RetrievalResult } from '../../ai/vector/vector.interface';
import { env } from '../../config/env';

export class RetrievalService {
  async search(query: string): Promise<RetrievalResult[]> {
    // Top-K and Threshold configurable via Env
    const topK = parseInt(env.RAG_TOP_K || '3');
    const threshold = parseFloat(env.RAG_SIMILARITY_THRESHOLD || '0.75');

    // 1. Embed query
    const queryVector = await googleEmbeddingProvider.embedQuery(query);

    // 2. Search
    const results = await pgVectorStore.similaritySearch(queryVector, topK, threshold);
    
    return results;
  }
}

export const retrievalService = new RetrievalService();
