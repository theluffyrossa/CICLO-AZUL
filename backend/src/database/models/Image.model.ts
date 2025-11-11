import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Collection } from './Collection.model';

@Table({
  tableName: 'images',
  timestamps: true,
  paranoid: true,
})
export class Image extends Model {
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
    type: DataType.STRING(500),
    allowNull: false,
    comment: 'File path or URL',
  })
  declare url: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare filename: string | null;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  declare mimeType: string | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'File size in bytes',
  })
  declare fileSize: number | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare width: number | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare height: number | null;

  @Column({
    type: DataType.DECIMAL(10, 8),
    allowNull: true,
    comment: 'GPS latitude where photo was taken',
  })
  declare latitude: number | null;

  @Column({
    type: DataType.DECIMAL(11, 8),
    allowNull: true,
    comment: 'GPS longitude where photo was taken',
  })
  declare longitude: number | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Date/time photo was captured',
  })
  declare capturedAt: Date | null;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Device used to capture',
  })
  declare deviceInfo: string | null;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'LGPD consent for images containing people',
  })
  declare consentGiven: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string | null;

  @BelongsTo(() => Collection, {
    foreignKey: 'collectionId',
    as: 'collection',
  })
  declare collection?: Collection;

  toJSON(): Record<string, unknown> {
    const values = { ...this.get() };
    delete values.deletedAt;
    return values;
  }
}
