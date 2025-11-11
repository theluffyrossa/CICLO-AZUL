import {
  Table,
  Column,
  Model,
  DataType,
  BeforeCreate,
  BeforeUpdate,
  HasMany,
} from 'sequelize-typescript';
import { UserRole } from '@shared/types';
import { hashPassword } from '@shared/utils/password.util';
import { Collection } from './Collection.model';
import { AuditLog } from './AuditLog.model';

@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true,
})
export class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  })
  declare email: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    allowNull: false,
    defaultValue: UserRole.OPERATOR,
  })
  declare role: UserRole;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare active: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare lastLoginAt: Date | null;

  @HasMany(() => Collection, {
    foreignKey: 'userId',
    as: 'collections',
  })
  collections?: Collection[];

  @HasMany(() => AuditLog, {
    foreignKey: 'userId',
    as: 'auditLogs',
  })
  auditLogs?: AuditLog[];

  @BeforeCreate
  @BeforeUpdate
  static async hashPasswordBeforeSave(instance: User): Promise<void> {
    if (instance.password && (instance.changed('password') || instance.isNewRecord)) {
      instance.password = await hashPassword(instance.password);
    }
  }

  toJSON(): Record<string, unknown> {
    const values = { ...this.get() };
    delete values.password;
    delete values.deletedAt;
    return values;
  }
}
