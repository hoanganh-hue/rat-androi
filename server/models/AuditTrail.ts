// AuditTrail Model - Ghi lại mọi hành động của người dùng
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Optional } from "sequelize";
import { User } from "./User";

export interface AuditTrailAttributes {
  id: number;
  user_id: number;
  action: string;
  target_id?: string | null;
  target_type?: string | null;
  metadata: any; // JSON metadata
  ip_address?: string | null;
  user_agent?: string | null;
  timestamp: Date;
}

export interface AuditTrailCreationAttributes
  extends Optional<
    AuditTrailAttributes,
    | "id"
    | "timestamp"
    | "target_id"
    | "target_type"
    | "ip_address"
    | "user_agent"
  > {}

@Table({
  tableName: "audit_trail",
  timestamps: false,
  createdAt: "timestamp",
})
export class AuditTrail extends Model<
  AuditTrailAttributes,
  AuditTrailCreationAttributes
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  user_id!: number;

  @BelongsTo(() => User)
  user?: User;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  action!: string;

  @Column(DataType.STRING(255))
  target_id?: string | null;

  @Column(DataType.STRING(100))
  target_type?: string | null;

  @AllowNull(false)
  @Column(DataType.JSON)
  metadata!: any;

  @Column(DataType.STRING(45))
  ip_address?: string | null;

  @Column(DataType.STRING(500))
  user_agent?: string | null;

  @Default(DataType.NOW)
  @Column(DataType.DATE)
  timestamp!: Date;
}

export default AuditTrail;
