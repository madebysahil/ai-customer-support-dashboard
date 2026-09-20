export interface VectorRecord {
  id: string; // The DocumentChunk ID
  vector: number[];
  metadata?: any;
}

export interface RetrievalResult {
  id: string;
  content: string;
  documentId: string;
  score: number;
}

export interface IVectorStore {
  /**
   * Save records to the vector database.
   */
  upsert(records: VectorRecord[]): Promise<void>;

  /**
   * Perform a similarity search against a query vector.
   * Returns top K matches above the given threshold.
   */
  similaritySearch(
    queryVector: number[], 
    topK: number, 
    threshold: number, 
    filter?: any
  ): Promise<RetrievalResult[]>;

  /**
   * Delete records by document ID.
   */
  deleteByDocument(documentId: string): Promise<void>;
}
