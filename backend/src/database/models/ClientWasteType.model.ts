import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Client } from './Client.model';
import { WasteType } from './WasteType.model';

@Table({
  tableName: 'client_waste_types',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['client_id', 'waste_type_id'],
    },
  ],
})
export class ClientWasteType extends Model {
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

  @ForeignKey(() => WasteType)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare wasteTypeId: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare active: boolean;

  @BelongsTo(() => Client, {
    foreignKey: 'clientId',
    as: 'client',
  })
  declare client?: Client;

  @BelongsTo(() => WasteType, {
    foreignKey: 'wasteTypeId',
    as: 'wasteType',
  })
  declare wasteType?: WasteType;
}
