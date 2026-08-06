import { Request, Response, NextFunction } from 'express';

interface AccessRequirements {
  roles?: string[];
  permissions?: string[]; // For future extension
}

/**
 * Authorization middleware.
 * Expects requireAuth middleware to run before this (so req.user exists).
 */
export const requireAccess = (requirements: AccessRequirements) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        type: 'about:blank',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication required.',
        instance: req.originalUrl,
      });
    }

    const { roles, permissions } = requirements;

    // Role-based authorization
    if (roles && roles.length > 0) {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          type: 'about:blank',
          title: 'Forbidden',
          status: 403,
          detail: 'You do not have the required role to access this resource.',
          instance: req.originalUrl,
        });
      }
    }

    // Permission-based authorization (Placeholder for future)
    if (permissions && permissions.length > 0) {
      // Logic for checking specific permissions (e.g., from DB or JWT)
      // if (!hasPermissions(req.user, permissions)) return res.status(403)...
    }

    next();
  };
};
