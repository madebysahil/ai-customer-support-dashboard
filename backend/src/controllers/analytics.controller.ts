import { Request, Response, NextFunction } from 'express';
import { analyticsAggregationService } from '../analytics/analytics.service';

export class AnalyticsController {
  async getAiMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const range = parseInt(req.query.days as string) || 30;
      const data = await analyticsAggregationService.getAiKpis(range);
      res.status(200).json({ data, meta: { rangeDays: range } });
    } catch (error) {
      next(error);
    }
  }

  // Future endpoints for Business, RAG, and System metrics would follow this pattern.
}

export const analyticsController = new AnalyticsController();
