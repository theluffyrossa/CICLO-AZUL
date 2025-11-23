import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { CollectionStatus, TreatmentType, ApprovalStatus } from '@shared/types';
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
  underscored: true,
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
    type: DataType.ENUM(...Object.values(TreatmentType)),
    allowNull: false,
    comment: 'Type of waste treatment applied',
  })
  declare treatmentType: TreatmentType;

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

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Additional metadata about the collection',
  })
  declare metadata: Record<string, unknown> | null;

  @Column({
    type: DataType.ENUM(...Object.values(ApprovalStatus)),
    allowNull: false,
    defaultValue: ApprovalStatus.PENDING_APPROVAL,
    comment: 'Approval status for collection validation',
  })
  declare approvalStatus: ApprovalStatus;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    comment: 'Admin user who approved/rejected the collection',
  })
  declare approvedBy: string | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Timestamp when collection was approved/rejected',
  })
  declare approvedAt: Date | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Reason for rejection if status is REJECTED',
  })
  declare rejectionReason: string | null;

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

  @BelongsTo(() => User, {
    foreignKey: 'approvedBy',
    as: 'approver',
  })
  declare approver?: User;

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
