// Audit Trail Routes - View audit logs
import express, { Response } from "express";
import { AuditTrail, User } from "../models";
import { authenticate, AuthRequest } from "../middleware/auth";
import { adminOrManager } from "../middleware/authorize";
import { auditValidation } from "../middleware/validation";
import logger from "../utils/logger";
import { Op } from "sequelize";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/audit
 * Get audit logs with filters
 */
router.get(
  "/",
  adminOrManager,
  auditValidation.list,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { user_id, action, startDate, endDate, limit = 100 } = req.query;

      const where: any = {};

      if (user_id) {
        where.user_id = user_id;
      }

      if (action) {
        where.action = { [Op.like]: `%${action}%` };
      }

      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) {
          where.timestamp[Op.gte] = new Date(startDate as string);
        }
        if (endDate) {
          where.timestamp[Op.lte] = new Date(endDate as string);
        }
      }

      const logs = await AuditTrail.findAll({
        where,
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "username", "role"],
          },
        ],
        order: [["timestamp", "DESC"]],
        limit: parseInt(limit as string, 10),
      });

      res.json({ logs });
    } catch (error) {
      logger.error("Get audit logs error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

/**
 * GET /api/audit/export
 * Export audit logs as CSV
 */
router.get(
  "/export",
  adminOrManager,
  auditValidation.export,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      const where: any = {};

      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) {
          where.timestamp[Op.gte] = new Date(startDate as string);
        }
        if (endDate) {
          where.timestamp[Op.lte] = new Date(endDate as string);
        }
      }

      const logs = await AuditTrail.findAll({
        where,
        include: [
          {
            model: User,
            as: "user",
            attributes: ["username"],
          },
        ],
        order: [["timestamp", "DESC"]],
      });

      // Generate CSV
      const csv = [
        "Timestamp,User,Action,Target Type,Target ID,IP Address",
        ...logs.map((log) => {
          const user = log.user ? (log.user as any).username : "Unknown";
          return `${log.timestamp},${user},${log.action},${log.target_type || ""},${log.target_id || ""},${log.ip_address || ""}`;
        }),
      ].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=audit-log.csv",
      );
      res.send(csv);
    } catch (error) {
      logger.error("Export audit logs error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
