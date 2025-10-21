// Device Management Routes - List, detail, and send commands
import express, { Response } from 'express';
import { Device, DeviceLog, Command, CommandStatus, CommandType } from '../models';
import { authenticate, AuthRequest } from '../middleware/auth';
import { canViewDevices, canControlDevices } from '../middleware/authorize';
import { auditLog } from '../middleware/audit';
import { deviceValidation } from '../middleware/validation';
import { emitToDevice, isDeviceOnline } from '../utils/socketBridge';
import logger from '../utils/logger';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/devices
 * Get all devices
 */
router.get(
  '/',
  canViewDevices,
  auditLog({ action: 'devices.list' }),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const devices = await Device.findAll({
        order: [['last_seen_at', 'DESC']],
        attributes: ['id', 'device_id', 'model', 'version', 'ip', 'last_seen_at', 'created_at'],
      });

      // Add online status
      const devicesWithStatus = devices.map(device => ({
        ...device.toJSON(),
        isOnline: isDeviceOnline(device.device_id),
      }));

      res.json({ devices: devicesWithStatus });
    } catch (error) {
      logger.error('Get devices error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /api/devices/:id
 * Get device detail with logs and command history
 */
router.get(
  '/:id',
  canViewDevices,
  deviceValidation.getById,
  auditLog({ action: 'devices.view', targetType: 'device' }),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const device = await Device.findByPk(req.params.id);

      if (!device) {
        res.status(404).json({ error: 'Device not found' });
        return;
      }

      // Get device logs
      const logs = await DeviceLog.findAll({
        where: { device_id: device.id },
        order: [['created_at', 'DESC']],
        limit: 50,
      });

      // Get command history
      const commands = await Command.findAll({
        where: { device_id: device.id },
        order: [['created_at', 'DESC']],
        limit: 50,
        include: ['creator'],
      });

      res.json({
        device: {
          ...device.toJSON(),
          isOnline: isDeviceOnline(device.device_id),
        },
        logs,
        commands,
      });
    } catch (error) {
      logger.error('Get device detail error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * POST /api/devices/:id/command
 * Send command to device
 */
router.post(
  '/:id/command',
  canControlDevices,
  deviceValidation.sendCommand,
  auditLog({ action: 'devices.sendCommand', targetType: 'device' }),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const device = await Device.findByPk(req.params.id);

      if (!device) {
        res.status(404).json({ error: 'Device not found' });
        return;
      }

      const { command, params = {} } = req.body;

      if (!command) {
        res.status(400).json({ error: 'Command is required' });
        return;
      }

      // Check if device is online
      if (!isDeviceOnline(device.device_id)) {
        res.status(503).json({ error: 'Device is offline' });
        return;
      }

      // Create command record
      const cmdRecord = await Command.create({
        device_id: device.id,
        command: command as CommandType,
        params,
        status: CommandStatus.PENDING,
        created_by: req.user!.id,
      });

      // Emit command via Socket.IO
      const sent = emitToDevice(device.device_id, command, params);

      if (sent) {
        await cmdRecord.update({ status: CommandStatus.SENT });
        logger.info(`Command sent to device ${device.device_id}: ${command}`);
      } else {
        await cmdRecord.update({ 
          status: CommandStatus.ERROR,
          error_message: 'Failed to send command to device',
        });
      }

      res.json({
        message: sent ? 'Command sent successfully' : 'Failed to send command',
        commandId: cmdRecord.id,
        status: cmdRecord.status,
      });
    } catch (error) {
      logger.error('Send command error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * DELETE /api/devices/:id
 * Delete device and all its logs
 */
import { canManageUsers } from '../middleware/authorize';

router.delete(
  '/:id',
  canManageUsers,
  deviceValidation.delete,
  auditLog({ action: 'devices.delete', targetType: 'device' }),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const device = await Device.findByPk(req.params.id);

      if (!device) {
        res.status(404).json({ error: 'Device not found' });
        return;
      }

      // Delete all associated logs and commands
      await DeviceLog.destroy({ where: { device_id: device.id } });
      await Command.destroy({ where: { device_id: device.id } });
      await device.destroy();

      logger.info(`Device deleted: ${device.device_id}`);

      res.json({ message: 'Device deleted successfully' });
    } catch (error) {
      logger.error('Delete device error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
