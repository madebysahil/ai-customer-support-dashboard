export interface IEmbeddingProvider {
  /**
   * Generates embeddings for an array of strings.
   * Returns an array of float arrays (the vectors).
   */
  embedChunks(chunks: string[]): Promise<number[][]>;
  
  /**
   * Generates a single embedding for a query.
   */
  embedQuery(query: string): Promise<number[]>;
  
  getModelName(): string;
  getVersion(): string;
}
