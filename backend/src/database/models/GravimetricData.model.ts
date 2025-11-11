import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { GravimetricDataSource } from '@shared/types';
import { Collection } from './Collection.model';

@Table({
  tableName: 'gravimetric_data',
  timestamps: true,
  paranoid: false,
})
export class GravimetricData extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Collection)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare collectionId: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
    comment: 'Weight in kilograms',
  })
  declare weightKg: number;

  @Column({
    type: DataType.ENUM(...Object.values(GravimetricDataSource)),
    allowNull: false,
    defaultValue: GravimetricDataSource.MANUAL,
  })
  declare source: GravimetricDataSource;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Device or scale identifier',
  })
  declare deviceId: string | null;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Additional metadata from source',
  })
  declare metadata: Record<string, unknown> | null;

  @BelongsTo(() => Collection, {
    foreignKey: 'collectionId',
    as: 'collection',
  })
  declare collection?: Collection;

  toJSON(): Record<string, unknown> {
    const values = { ...this.get() };
    return values;
  }
}
