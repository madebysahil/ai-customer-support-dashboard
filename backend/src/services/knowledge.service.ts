import { PrismaClient, DocumentStatus } from '@prisma/client';
const prisma = new PrismaClient();

export class KnowledgeService {
  async listDocuments(query: string = '', category?: string, status?: DocumentStatus, skip: number = 0, take: number = 20) {
    const where: any = {};
    if (query) {
      where.title = { contains: query, mode: 'insensitive' };
      // Search chunks
      // This is a simplified search for prototype, real system would use embeddings
    }
    if (category) {
      where.category = category;
    }
    if (status) {
      where.status = status;
    }

    const [documents, total] = await Promise.all([
      prisma.knowledgeDocument.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          authorId: true,
        }
      }),
      prisma.knowledgeDocument.count({ where })
    ]);

    return { documents, total };
  }

  async getDocument(id: string) {
    const doc = await prisma.knowledgeDocument.findUnique({
      where: { id },
      include: {
        chunks: true // Get all chunks to assemble the content for the UI
      }
    });

    if (!doc) return null;

    // We assemble the content from chunks for the simple UI
    const content = doc.chunks.map(c => c.content).join('\n\n');

    return {
      ...doc,
      content, // Attached for the frontend
    };
  }

  async createDocument(data: { title: string; content: string; category?: string; authorId: string }) {
    return prisma.knowledgeDocument.create({
      data: {
        title: data.title,
        originalFileName: data.title + '.txt',
        mimeType: 'text/plain',
        category: data.category,
        authorId: data.authorId,
        status: 'READY', // Immediately ready for this mock phase
        chunks: {
          create: {
            content: data.content || '',
            tokenCount: Math.ceil((data.content?.length || 0) / 4), // Rough estimate
            embeddingModel: 'text-embedding-004',
            embeddingVersion: '1',
          }
        }
      },
      include: {
        chunks: true
      }
    });
  }

  async updateDocument(id: string, data: { title?: string; category?: string; status?: DocumentStatus }) {
    return prisma.knowledgeDocument.update({
      where: { id },
      data,
    });
  }

  async deleteDocument(id: string) {
    return prisma.knowledgeDocument.delete({
      where: { id },
    });
  }
}

export const knowledgeService = new KnowledgeService();
