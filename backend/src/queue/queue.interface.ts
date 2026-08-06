export interface IBackgroundQueue {
  addJob(jobName: string, data: any): Promise<void>;
}

export class MemoryQueue implements IBackgroundQueue {
  private handlers = new Map<string, (data: any) => Promise<void>>();

  registerHandler(jobName: string, handler: (data: any) => Promise<void>) {
    this.handlers.set(jobName, handler);
  }

  async addJob(jobName: string, data: any): Promise<void> {
    const handler = this.handlers.get(jobName);
    if (!handler) {
      console.warn(`No handler for job: ${jobName}`);
      return;
    }
    // Execute asynchronously (fire and forget to mimic a real queue)
    setImmediate(async () => {
      try {
        await handler(data);
      } catch (error) {
        console.error(`Job ${jobName} failed:`, error);
      }
    });
  }
}

export const backgroundQueue = new MemoryQueue();
