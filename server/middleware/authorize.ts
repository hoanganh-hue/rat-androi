// Authorization Middleware - Role-Based Access Control (RBAC)
import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from './auth';

// Runtime role constants to avoid importing models
const ROLE = {
  ADMIN: 'admin' as UserRole,
  MANAGER: 'manager' as UserRole,
  OPERATOR: 'operator' as UserRole,
  VIEWER: 'viewer' as UserRole,
} as const;

/**
 * Authorization middleware factory
 * @param allowedRoles - Array of roles allowed to access the route
 */
export const authorize = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        error: 'Forbidden', 
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}` 
      });
      return;
    }

    next();
  };
};

// Predefined role combinations
export const adminOnly = authorize([ROLE.ADMIN]);
export const adminOrManager = authorize([ROLE.ADMIN, ROLE.MANAGER]);
export const canViewDevices = authorize([ROLE.ADMIN, ROLE.MANAGER, ROLE.OPERATOR, ROLE.VIEWER]);
export const canControlDevices = authorize([ROLE.ADMIN, ROLE.MANAGER, ROLE.OPERATOR]);
export const canManageUsers = authorize([ROLE.ADMIN]);

export default authorize;
