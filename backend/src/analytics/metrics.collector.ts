import { prisma } from '../utils/prisma';
import { AnalyticsEventType } from './events.constants';
import { backgroundQueue } from '../queue/queue.interface';

export interface MetricPayload {
  eventType: AnalyticsEventType;
  metricVal?: number;
  dimensions?: Record<string, any>;
  correlationId?: string;
}

export interface IMetricsCollector {
  record(payload: MetricPayload): void;
}

export class AsyncMetricsCollector implements IMetricsCollector {
  constructor() {
    backgroundQueue.registerHandler('analytics:record', async (data: MetricPayload) => {
      await prisma.analyticsEvent.create({
        data: {
          eventType: data.eventType,
          metricVal: data.metricVal,
          dimensions: data.dimensions ? {
            ...data.dimensions,
            correlationId: data.correlationId,
          } : { correlationId: data.correlationId },
        }
      });
    });
  }

  record(payload: MetricPayload): void {
    // Fire and forget via the queue abstraction so it never blocks the request thread.
    backgroundQueue.addJob('analytics:record', payload).catch(e => {
      console.error('Failed to queue analytics event', e);
    });
  }
}

export const metricsCollector = new AsyncMetricsCollector();
