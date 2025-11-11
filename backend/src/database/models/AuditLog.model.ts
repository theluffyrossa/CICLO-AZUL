import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { AuditAction } from '@shared/types';
import { User } from './User.model';

@Table({
  tableName: 'audit_logs',
  timestamps: true,
  updatedAt: false,
  paranoid: false,
})
export class AuditLog extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    comment: 'User who performed the action',
  })
  declare userId: string | null;

  @Column({
    type: DataType.ENUM(...Object.values(AuditAction)),
    allowNull: false,
  })
  declare action: AuditAction;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: 'Table affected by action',
  })
  declare tableName: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
    comment: 'ID of affected record',
  })
  declare recordId: string | null;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Data before change',
  })
  declare beforeData: Record<string, unknown> | null;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Data after change',
  })
  declare afterData: Record<string, unknown> | null;

  @Column({
    type: DataType.INET,
    allowNull: true,
    comment: 'IP address of request',
  })
  declare ipAddress: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'User agent string',
  })
  declare userAgent: string | null;

  @BelongsTo(() => User, {
    foreignKey: 'userId',
    as: 'user',
  })
  declare user?: User;

  toJSON(): Record<string, unknown> {
    const values = { ...this.get() };
    return values;
  }
}
