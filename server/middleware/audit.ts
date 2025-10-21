// Audit Middleware - Ghi log mọi hành động
import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { AuditTrail } from "../models";

export interface AuditOptions {
  action: string;
  targetType?: string;
}

/**
 * Audit middleware factory
 * Automatically logs user actions to audit_trail table
 */
export const auditLog = (options: AuditOptions) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Store original res.json
      const originalJson = res.json.bind(res);

      // Override res.json to capture response
      res.json = function (data: any) {
        // Only log if request was successful (2xx status)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Create audit log asynchronously (don't await to not block response)
          AuditTrail.create({
            user_id: req.user?.id || 0,
            action: options.action,
            target_id: req.params.id || req.params.deviceId || null,
            target_type: options.targetType || null,
            metadata: {
              method: req.method,
              path: req.path,
              params: req.params,
              query: req.query,
              body: sanitizeBody(req.body),
              statusCode: res.statusCode,
            },
            ip_address: req.ip || req.socket.remoteAddress || null,
            user_agent: req.get("user-agent") || null,
          }).catch((error) => {
            console.error("Failed to create audit log:", error);
          });
        }

        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error("Audit middleware error:", error);
      next();
    }
  };
};

// Remove sensitive data from audit logs
function sanitizeBody(body: any): any {
  if (!body) return body;

  const sanitized = { ...body };
  const sensitiveFields = ["password", "password_hash", "token", "secret"];

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = "[REDACTED]";
    }
  }

  return sanitized;
}

export default auditLog;
