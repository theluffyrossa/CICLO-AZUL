import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Client } from './Client.model';
import { Collection } from './Collection.model';

@Table({
  tableName: 'units',
  timestamps: true,
  paranoid: true,
})
export class Unit extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Client)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'client_id',
  })
  declare clientId: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Type of establishment (factory, office, etc)',
  })
  declare type: string | null;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare address: string | null;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  declare city: string | null;

  @Column({
    type: DataType.STRING(2),
    allowNull: true,
  })
  declare state: string | null;

  @Column({
    type: DataType.STRING(9),
    allowNull: true,
  })
  declare zipCode: string | null;

  @Column({
    type: DataType.DECIMAL(10, 8),
    allowNull: true,
    comment: 'GPS latitude',
  })
  declare latitude: number | null;

  @Column({
    type: DataType.DECIMAL(11, 8),
    allowNull: true,
    comment: 'GPS longitude',
  })
  declare longitude: number | null;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Responsible person at unit',
  })
  declare responsibleName: string | null;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  declare responsiblePhone: string | null;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare active: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare notes: string | null;

  @BelongsTo(() => Client, {
    foreignKey: 'clientId',
    as: 'client',
  })
  declare client?: Client;

  @HasMany(() => Collection, {
    foreignKey: 'unitId',
    as: 'collections',
  })
  declare collections?: Collection[];

  toJSON(): Record<string, unknown> {
    const values = { ...this.get() };
    delete values.deletedAt;
    return values;
  }
}
