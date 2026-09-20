export interface IChunkingStrategy {
  chunk(text: string): string[];
}

export class FixedSizeChunking implements IChunkingStrategy {
  constructor(private chunkSize: number = 1000, private overlap: number = 100) {}

  chunk(text: string): string[] {
    const chunks: string[] = [];
    let i = 0;
    while (i < text.length) {
      chunks.push(text.slice(i, i + this.chunkSize));
      i += this.chunkSize - this.overlap;
    }
    return chunks;
  }
}

export class ChunkingService {
  private strategy: IChunkingStrategy;

  constructor(strategy: IChunkingStrategy = new FixedSizeChunking()) {
    this.strategy = strategy;
  }

  setStrategy(strategy: IChunkingStrategy) {
    this.strategy = strategy;
  }

  processText(text: string): string[] {
    return this.strategy.chunk(text);
  }
}

export const chunkingService = new ChunkingService();
