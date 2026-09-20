import { EventEmitter } from 'events';
import { IEventBus, ApplicationEvent } from './event.bus.interface';
import { logger } from '../utils/logger';

export class MemoryEventBus implements IEventBus {
  private emitter = new EventEmitter();

  async publish(event: ApplicationEvent): Promise<void> {
    // Fire and forget to decouple business logic from listeners
    setImmediate(() => {
      try {
        this.emitter.emit(event.type, event);
      } catch (err: any) {
        logger.error(`Event Bus error publishing ${event.type}`, { error: err.message });
      }
    });
  }

  subscribe<T extends ApplicationEvent['type']>(
    eventType: T,
    handler: (event: Extract<ApplicationEvent, { type: T }>) => Promise<void>
  ): void {
    this.emitter.on(eventType, async (event) => {
      try {
        await handler(event);
      } catch (err: any) {
        logger.error(`Event Handler failed for ${eventType}`, { error: err.message });
      }
    });
  }
}

export const eventBus = new MemoryEventBus();
