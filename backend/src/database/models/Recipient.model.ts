import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  HasMany,
} from 'sequelize-typescript';
import { Collection } from './Collection.model';

export enum RecipientType {
  COMPOSTING_CENTER = 'COMPOSTING_CENTER',
  RECYCLING_ASSOCIATION = 'RECYCLING_ASSOCIATION',
  LANDFILL = 'LANDFILL',
  INDIVIDUAL = 'INDIVIDUAL',
  COOPERATIVE = 'COOPERATIVE',
  OTHER = 'OTHER',
}

@Table({
  tableName: 'recipients',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class Recipient extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
  })
  declare id: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.ENUM(...Object.values(RecipientType)),
    allowNull: false,
  })
  declare type: RecipientType;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  declare document: string | null;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  declare secondaryDocument: string | null;

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
    type: DataType.STRING(10),
    allowNull: true,
  })
  declare zipCode: string | null;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  declare phone: string | null;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare email: string | null;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare responsibleName: string | null;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  declare responsiblePhone: string | null;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  declare active: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare notes: string | null;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare acceptedWasteTypes: string[] | null;

  @HasMany(() => Collection, {
    foreignKey: 'recipientId',
    as: 'collections',
  })
  declare collections?: Collection[];

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date | null;
}
