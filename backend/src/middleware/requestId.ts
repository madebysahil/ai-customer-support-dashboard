import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

// Extend Express Request interface to include req.id
declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

/**
 * Middleware to assign a unique request ID to each incoming request.
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const reqId = req.headers['x-request-id'] as string || randomUUID();
  req.id = reqId;
  res.setHeader('X-Request-Id', reqId);
  next();
};
