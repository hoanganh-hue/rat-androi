// Authentication Middleware - JWT verification
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Local role type to avoid importing models in middleware
export type UserRole = "admin" | "manager" | "operator" | "viewer";

const JWT_SECRET =
  process.env.JWT_SECRET || "dogerat-secret-key-change-in-production";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: UserRole;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: number;
        username: string;
        role: UserRole;
      };

      // Attach user info to request
      req.user = decoded;
      next();
    } catch (jwtError) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Generate JWT token
export const generateToken = (user: {
  id: number;
  username: string;
  role: UserRole;
}): string => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "24h" },
  );
};

export default authenticate;
