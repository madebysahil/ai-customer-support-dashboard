import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Standard RFC 7807 problem details response for consistent error formatting.
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err.message || 'Internal Server Error', { error: err, requestId: req.id });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    type: 'about:blank',
    title: message,
    status: statusCode,
    detail: err.detail || message,
    instance: req.originalUrl,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
