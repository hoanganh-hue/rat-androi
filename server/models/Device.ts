// Device Model - Lưu thông tin thiết bị Android kết nối
import { Table, Column, Model, DataType, PrimaryKey, Default, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { User } from './User';

export interface DeviceAttributes {
  id: number;
  socket_id: string;
  device_id: string;
  model: string;
  version: string;
  ip: string;
  user_agent?: string | null;
  last_seen_at?: Date | null;
  owner_user_id?: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface DeviceCreationAttributes extends Optional<DeviceAttributes, 'id' | 'created_at' | 'updated_at' | 'user_agent' | 'last_seen_at' | 'owner_user_id'> {}

@Table({
  tableName: 'devices',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Device extends Model<DeviceAttributes, DeviceCreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: number;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  socket_id!: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  device_id!: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  model!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  version!: string;

  @AllowNull(false)
  @Column(DataType.STRING(45))
  ip!: string;

  @Column(DataType.STRING(500))
  user_agent?: string | null;

  @Column(DataType.DATE)
  last_seen_at?: Date | null;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  owner_user_id?: number | null;

  @BelongsTo(() => User)
  owner?: User;

  @Column(DataType.DATE)
  created_at!: Date;

  @Column(DataType.DATE)
  updated_at!: Date;

  // Virtual field to check if device is online
  get isOnline(): boolean {
    if (!this.last_seen_at) return false;
    const now = new Date();
    const lastSeen = new Date(this.last_seen_at);
    const diff = now.getTime() - lastSeen.getTime();
    return diff < 15000; // Consider online if seen within 15 seconds
  }
}

export default Device;
