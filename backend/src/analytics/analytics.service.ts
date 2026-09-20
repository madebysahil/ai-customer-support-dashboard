import { prisma } from '../utils/prisma';
import { env } from '../config/env';
import { AnalyticsEvents } from './events.constants';

export class AnalyticsAggregationService {
  /**
   * Retrieves high-level KPIs for the AI Dashboard
   */
  async getAiKpis(days: number = 30) {
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
    
    // Time Series (fetch all and group in memory to avoid raw sql complexity across drivers)
    const allEvents = await prisma.analyticsEvent.findMany({
      where: { recordedAt: { gte: sinceDate } },
      select: { eventType: true, recordedAt: true }
    });
    
    const timeSeriesMap: Record<string, { date: string, responses: number, escalations: number }> = {};
    for (let i = 0; i <= days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      timeSeriesMap[dateStr] = { date: dateStr, responses: 0, escalations: 0 };
    }
    
    allEvents.forEach(e => {
      const dateStr = e.recordedAt.toISOString().split('T')[0];
      if (timeSeriesMap[dateStr]) {
        if (e.eventType === AnalyticsEvents.AI_RESPONSE) timeSeriesMap[dateStr].responses++;
        if (e.eventType === AnalyticsEvents.AI_ESCALATION) timeSeriesMap[dateStr].escalations++;
      }
    });
    
    const timeSeries = Object.values(timeSeriesMap).sort((a, b) => a.date.localeCompare(b.date));
    
    // Escalation by priority
    const escalations = await prisma.analyticsEvent.findMany({
      where: { eventType: AnalyticsEvents.AI_ESCALATION, recordedAt: { gte: sinceDate } },
      select: { dimensions: true }
    });
    
    const priorityCounts: Record<string, number> = { HIGH: 0, MEDIUM: 0, LOW: 0, URGENT: 0 };
    escalations.forEach(e => {
      const dims = e.dimensions as any;
      if (dims && dims.priority) {
        priorityCounts[dims.priority] = (priorityCounts[dims.priority] || 0) + 1;
      }
    });
    
    const escalationByPriority = Object.keys(priorityCounts)
      .filter(k => priorityCounts[k] > 0)
      .map(name => ({ name, value: priorityCounts[name] }));

    return {
      totalResponses: aiResponsesCount,
      escalationRate: aiResponsesCount > 0 ? (aiEscalationsCount / aiResponsesCount) * 100 : 0,
      avgConfidence: confidenceAgg._avg.metricVal || 0,
      thresholdAlerts: {
         escalationCritical: (aiResponsesCount > 0 ? (aiEscalationsCount / aiResponsesCount) : 0) > parseFloat(env.ALERT_ESCALATION_THRESHOLD || '0.2')
      },
      timeSeries,
      escalationByPriority
    };
  }

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
