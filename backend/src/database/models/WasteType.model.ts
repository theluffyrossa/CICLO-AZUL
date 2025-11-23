import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  BelongsToMany,
} from 'sequelize-typescript';
import { WasteCategory } from '@shared/types';
import { Collection } from './Collection.model';
import { Client } from './Client.model';
import { ClientWasteType } from './ClientWasteType.model';

@Table({
  tableName: 'waste_types',
  timestamps: true,
  paranoid: true,
})
export class WasteType extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
  })
  declare name: string;

  @Column({
    type: DataType.ENUM(...Object.values(WasteCategory)),
    allowNull: false,
  })
  declare category: WasteCategory;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string | null;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    comment: 'Unit of measurement (kg, L, m³)',
  })
  declare unit: string | null;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare active: boolean;

  @HasMany(() => Collection, {
    foreignKey: 'wasteTypeId',
    as: 'collections',
  })
  declare collections?: Collection[];

  @BelongsToMany(() => Client, {
    through: () => ClientWasteType,
    foreignKey: 'wasteTypeId',
    otherKey: 'clientId',
    as: 'clients',
  })
  declare clients?: Client[];

  toJSON(): Record<string, unknown> {
    const values = { ...this.get() };
    delete values.deletedAt;
    return values;
  }
}
