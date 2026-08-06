import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
          title: 'Validation Error',
          status: 400,
          detail: 'One or more fields failed validation.',
          errors: error.errors,
          instance: req.originalUrl,
        });
      }
      next(error);
    }
  };
