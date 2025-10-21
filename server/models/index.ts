// Models Index - Export all models and initialize database
import { Sequelize } from 'sequelize-typescript';
import { sequelize } from '../db.config';
import { User, UserRole } from './User';
import { Device } from './Device';
import { DeviceLog, LogType } from './DeviceLog';
import { Command, CommandStatus, CommandType } from './Command';
import { AuditTrail } from './AuditTrail';

// Initialize models
sequelize.addModels([User, Device, DeviceLog, Command, AuditTrail]);

// Sync database (creates tables if they don't exist)
export async function initializeDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync all models
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ All models synchronized successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
}

// Export everything
export {
  sequelize,
  User,
  UserRole,
  Device,
  DeviceLog,
  LogType,
  Command,
  CommandStatus,
  CommandType,
  AuditTrail,
};

export default {
  sequelize,
  User,
  Device,
  DeviceLog,
  Command,
  AuditTrail,
  initializeDatabase,
};
