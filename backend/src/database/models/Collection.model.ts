import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { CollectionStatus } from '@shared/types';
import { Client } from './Client.model';
import { Unit } from './Unit.model';
import { User } from './User.model';
import { WasteType } from './WasteType.model';
import { GravimetricData } from './GravimetricData.model';
import { Image } from './Image.model';
import { Recipient } from './Recipient.model';

@Table({
  tableName: 'collections',
  timestamps: true,
  paranoid: true,
})
export class Collection extends Model {
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
  })
  declare clientId: string;

  @ForeignKey(() => Unit)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare unitId: string;

  @ForeignKey(() => WasteType)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare wasteTypeId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    comment: 'User responsible for collection',
  })
  declare userId: string;

  @ForeignKey(() => Recipient)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    comment: 'Final recipient/destination where waste is sent',
  })
  declare recipientId: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare collectionDate: Date;

  @Column({
    type: DataType.ENUM(...Object.values(CollectionStatus)),
    allowNull: false,
    defaultValue: CollectionStatus.SCHEDULED,
  })
  declare status: CollectionStatus;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare notes: string | null;

  @Column({
    type: DataType.DECIMAL(10, 8),
    allowNull: true,
    comment: 'GPS latitude at collection time',
  })
  declare latitude: number | null;

  @Column({
    type: DataType.DECIMAL(11, 8),
    allowNull: true,
    comment: 'GPS longitude at collection time',
  })
  declare longitude: number | null;

  @BelongsTo(() => Client, {
    foreignKey: 'clientId',
    as: 'client',
  })
  declare client?: Client;

  @BelongsTo(() => Unit, {
    foreignKey: 'unitId',
    as: 'unit',
  })
  declare unit?: Unit;

  @BelongsTo(() => WasteType, {
    foreignKey: 'wasteTypeId',
    as: 'wasteType',
  })
  declare wasteType?: WasteType;

  @BelongsTo(() => User, {
    foreignKey: 'userId',
    as: 'user',
  })
  declare user?: User;

  @BelongsTo(() => Recipient, {
    foreignKey: 'recipientId',
    as: 'recipient',
  })
  declare recipient?: Recipient;

  @HasMany(() => GravimetricData, {
    foreignKey: 'collectionId',
    as: 'gravimetricData',
  })
  declare gravimetricData?: GravimetricData[];

  @HasMany(() => Image, {
    foreignKey: 'collectionId',
    as: 'images',
  })
  declare images?: Image[];

  toJSON(): Record<string, unknown> {
    const values = { ...this.get() };
    delete values.deletedAt;
    return values;
  }
}
