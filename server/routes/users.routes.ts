// User Management Routes - CRUD operations (Admin only)
import express, { Response } from "express";
import bcrypt from "bcrypt";
import { User, UserRole } from "../models";
import { authenticate, AuthRequest } from "../middleware/auth";
import { adminOnly } from "../middleware/authorize";
import { auditLog } from "../middleware/audit";
import { userValidation } from "../middleware/validation";
import logger from "../utils/logger";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/users
 * Get all users (Admin only)
 */
router.get(
  "/",
  adminOnly,
  auditLog({ action: "users.list" }),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const users = await User.findAll({
        attributes: [
          "id",
          "username",
          "email",
          "role",
          "created_at",
          "last_login_at",
        ],
        order: [["created_at", "DESC"]],
      });

      res.json({ users });
    } catch (error) {
      logger.error("Get users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

/**
 * GET /api/users/:id
 * Get user by ID (Admin only)
 */
router.get(
  "/:id",
  adminOnly,
  userValidation.delete, // Reuse delete validation for ID check
  auditLog({ action: "users.view", targetType: "user" }),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: [
          "id",
          "username",
          "email",
          "role",
          "created_at",
          "last_login_at",
        ],
      });

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json(user);
    } catch (error) {
      logger.error("Get user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

/**
 * POST /api/users
 * Create new user (Admin only)
 */
router.post(
  "/",
  adminOnly,
  userValidation.create,
  auditLog({ action: "users.create" }),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { username, email, password, role } = req.body;

      if (!username || !email || !password) {
        res
          .status(400)
          .json({ error: "Username, email, and password are required" });
        return;
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      const user = await User.create({
        username,
        email,
        password_hash,
        role: role || UserRole.VIEWER,
      });

      logger.info(`User created by admin: ${username}`);

      res.status(201).json({
        message: "User created successfully",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      logger.error("Create user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

/**
 * PATCH /api/users/:id
 * Update user (Admin only)
 */
router.patch(
  "/:id",
  adminOnly,
  userValidation.update,
  auditLog({ action: "users.update", targetType: "user" }),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = await User.findByPk(req.params.id);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const { username, email, password, role } = req.body;
      const updates: any = {};

      if (username) updates.username = username;
      if (email) updates.email = email;
      if (role) updates.role = role;
      if (password) updates.password_hash = await bcrypt.hash(password, 10);

      await user.update(updates);

      logger.info(`User updated: ${user.username}`);

      res.json({
        message: "User updated successfully",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      logger.error("Update user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

/**
 * DELETE /api/users/:id
 * Delete user (Admin only)
 */
router.delete(
  "/:id",
  adminOnly,
  userValidation.delete,
  auditLog({ action: "users.delete", targetType: "user" }),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Prevent self-deletion
      if (req.params.id === String(req.user!.id)) {
        res.status(400).json({ error: "Cannot delete your own account" });
        return;
      }

      const user = await User.findByPk(req.params.id);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      await user.destroy();

      logger.info(`User deleted: ${user.username}`);

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      logger.error("Delete user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
