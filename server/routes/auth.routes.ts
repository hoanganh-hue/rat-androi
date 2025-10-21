// Authentication Routes - Login, Register
import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User, UserRole } from "../models";
import { generateToken } from "../middleware/auth";
import { authValidation } from "../middleware/validation";
import logger from "../utils/logger";

const router = express.Router();

/**
 * POST /api/auth/register
 * Register new user (Admin only in production, open for first user)
 */
router.post(
  "/register",
  authValidation.register,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, email, password, role } = req.body;

      if (!username || !email || !password) {
        res
          .status(400)
          .json({ error: "Username, email, and password are required" });
        return;
      }

      // Check if any user exists (first user becomes admin)
      const userCount = await User.count();
      const assignedRole =
        userCount === 0 ? UserRole.ADMIN : role || UserRole.VIEWER;

      // Check if username or email already exists
      const existing = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email }],
        } as any,
      });

      if (existing) {
        res.status(409).json({ error: "Username or email already exists" });
        return;
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        username,
        email,
        password_hash,
        role: assignedRole,
      });

      logger.info(`New user registered: ${username} (${assignedRole})`);

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
      logger.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

/**
 * POST /api/auth/login
 * Login with username/email and password
 */
router.post(
  "/login",
  authValidation.login,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: "Username and password are required" });
        return;
      }

      // Find user by username or email
      const user = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email: username }],
        } as any,
      });

      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password_hash);

      if (!isValid) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      // Update last login
      await user.update({ last_login_at: new Date() });

      // Generate token
      const token = generateToken(user);

      logger.info(`User logged in: ${user.username}`);

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      logger.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

/**
 * GET /api/auth/me
 * Get current user info (requires authentication)
 */
import { authenticate, AuthRequest } from "../middleware/auth";
import { Op } from "sequelize";

router.get(
  "/me",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = await User.findByPk(req.user!.id, {
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
      logger.error("Get current user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
