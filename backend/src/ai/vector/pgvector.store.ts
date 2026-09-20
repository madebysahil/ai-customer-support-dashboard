import { prisma } from '../../utils/prisma';
import { IVectorStore, VectorRecord, RetrievalResult } from './vector.interface';

export class PgVectorStore implements IVectorStore {
  async upsert(records: VectorRecord[]): Promise<void> {
    // In pgvector via Prisma, we usually update the chunks that were already inserted.
    // For each record, we update the `embeddingVector` field.
    for (const record of records) {
      // Prisma raw query required for pgvector `vector` type insertions
      const vectorString = `[${record.vector.join(',')}]`;
      await prisma.$executeRawUnsafe(
        `UPDATE document_chunks SET embedding_vector = '${vectorString}'::vector WHERE id = $1`,
        record.id
      );
    }
  }

  async similaritySearch(queryVector: number[], topK: number, threshold: number, filter?: any): Promise<RetrievalResult[]> {
    const vectorString = `[${queryVector.join(',')}]`;
    
    // PostgreSQL pgvector cosine distance operator is <=>
    // Score = 1 - (distance). Higher is more similar.
    // Ensure we only retrieve chunks whose similarity score > threshold.
    
    // Note: Parameterized query for vectorString is tricky in some Prisma versions. 
    // Best practice is to cast a string. We use Unsafe here cautiously; `vectorString` is built purely from floats.
    const results = await prisma.$queryRawUnsafe<any[]>(`
      SELECT id, document_id as "documentId", content, 
             1 - (embedding_vector <=> '${vectorString}'::vector) as score
      FROM document_chunks
      WHERE embedding_vector IS NOT NULL
        AND 1 - (embedding_vector <=> '${vectorString}'::vector) >= $1
      ORDER BY embedding_vector <=> '${vectorString}'::vector ASC
      LIMIT $2
    `, threshold, topK);

    return results.map(r => ({
      id: r.id,
      content: r.content,
      documentId: r.documentId,
      score: r.score,
    }));
  }

  async deleteByDocument(documentId: string): Promise<void> {
    await prisma.documentChunk.deleteMany({
      where: { documentId },
    });
  }
}

export const pgVectorStore = new PgVectorStore();
