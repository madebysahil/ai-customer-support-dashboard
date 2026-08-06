import { prisma } from '../../utils/prisma';
import { backgroundQueue } from '../../queue/queue.interface';
import { chunkingService } from './chunking.service';
import { googleEmbeddingProvider } from '../../ai/embeddings/google.embedding';
import { pgVectorStore } from '../../ai/vector/pgvector.store';
import { logger } from '../../utils/logger';

export class RagService {
  constructor() {
    // Register background job handler
    backgroundQueue.registerHandler('processDocument', this.processDocumentTask.bind(this));
  }

  async triggerDocumentProcessing(documentId: string) {
    await prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: { status: 'EXTRACTING' }
    });
    // Queue job
    await backgroundQueue.addJob('processDocument', { documentId });
  }

  private async processDocumentTask({ documentId }: { documentId: string }) {
    try {
      const doc = await prisma.knowledgeDocument.findUnique({ where: { id: documentId } });
      if (!doc) return;

      // 1. Extraction (Mocking PDF/HTML extraction based on a raw text field or storage fetch)
      // For this implementation, we assume the raw text was saved to a temp file or `doc.metadata.rawText` during upload.
      const rawText = (doc.metadata as any)?.rawText || "No text provided";

      // 2. Chunking
      await prisma.knowledgeDocument.update({ where: { id: documentId }, data: { status: 'CHUNKING' } });
      const chunks = chunkingService.processText(rawText);

      // 3. Saving initial chunks to DB to get IDs
      const savedChunks = await Promise.all(chunks.map(content => 
        prisma.documentChunk.create({
          data: {
            documentId,
            content,
            tokenCount: content.length / 4, // Rough approximation
            embeddingModel: googleEmbeddingProvider.getModelName(),
            embeddingVersion: googleEmbeddingProvider.getVersion(),
          }
        })
      ));

      // 4. Embedding
      await prisma.knowledgeDocument.update({ where: { id: documentId }, data: { status: 'EMBEDDING' } });
      const vectors = await googleEmbeddingProvider.embedChunks(chunks);

      // 5. Indexing in Vector Store
      await prisma.knowledgeDocument.update({ where: { id: documentId }, data: { status: 'INDEXING' } });
      
      const records = savedChunks.map((chunk, i) => ({
        id: chunk.id,
        vector: vectors[i],
      }));
      
      await pgVectorStore.upsert(records);

      // 6. Ready
      await prisma.knowledgeDocument.update({ where: { id: documentId }, data: { status: 'READY' } });
      logger.info(`Document ${documentId} processed and indexed successfully.`);

    } catch (error: any) {
      logger.error(`Failed to process document ${documentId}`, { error: error.message });
      await prisma.knowledgeDocument.update({ where: { id: documentId }, data: { status: 'FAILED' } });
    }
  }
}

export const ragService = new RagService();
