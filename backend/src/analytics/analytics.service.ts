import { prisma } from '../utils/prisma';
import { env } from '../config/env';
import { AnalyticsEvents } from './events.constants';

export class AnalyticsAggregationService {
  /**
   * Retrieves high-level KPIs for the AI Dashboard
   */
  async getAiKpis(days: number = 30) {
    const bucketStr = env.ANALYTICS_BUCKET_SIZE || 'day'; // 'day', 'hour', 'week'
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    // AI Responses count
    const aiResponsesCount = await prisma.analyticsEvent.count({
      where: { eventType: AnalyticsEvents.AI_RESPONSE, recordedAt: { gte: sinceDate } }
    });

    // AI Escalations count
    const aiEscalationsCount = await prisma.analyticsEvent.count({
      where: { eventType: AnalyticsEvents.AI_ESCALATION, recordedAt: { gte: sinceDate } }
    });

    // Average Confidence Score (where metricVal is confidence)
    const confidenceAgg = await prisma.analyticsEvent.aggregate({
      where: { eventType: AnalyticsEvents.AI_RESPONSE, recordedAt: { gte: sinceDate } },
      _avg: { metricVal: true }
    });

    return {
      totalResponses: aiResponsesCount,
      escalationRate: aiResponsesCount > 0 ? (aiEscalationsCount / aiResponsesCount) * 100 : 0,
      avgConfidence: confidenceAgg._avg.metricVal || 0,
      thresholdAlerts: {
         // Future: Trigger notification if escalationRate > env.ALERT_ESCALATION_THRESHOLD
         escalationCritical: (aiResponsesCount > 0 ? (aiEscalationsCount / aiResponsesCount) : 0) > parseFloat(env.ALERT_ESCALATION_THRESHOLD || '0.2')
      }
    };
  }

  /**
   * Cleans up old metrics based on configurable retention
   */
  async cleanupOldMetrics() {
    const retentionDays = parseInt(env.ANALYTICS_RETENTION_DAYS || '90');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    await prisma.analyticsEvent.deleteMany({
      where: {
        recordedAt: { lt: cutoffDate }
      }
    });
  }
}

export const analyticsAggregationService = new AnalyticsAggregationService();
