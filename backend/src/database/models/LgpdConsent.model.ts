import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { LegalBasis } from '@shared/types';
import { Client } from './Client.model';
import { User } from './User.model';

@Table({
  tableName: 'lgpd_consents',
  timestamps: true,
  paranoid: false,
})
export class LgpdConsent extends Model {
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

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: 'Type of consent (data_processing, image_use, etc)',
  })
  declare consentType: string;

  @Column({
    type: DataType.ENUM(...Object.values(LegalBasis)),
    allowNull: false,
    defaultValue: LegalBasis.CONSENT,
  })
  declare legalBasis: LegalBasis;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare granted: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare grantedAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'When consent was revoked',
  })
  declare revokedAt: Date | null;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    comment: 'User who collected consent',
  })
  declare collectedBy: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Additional notes about consent',
  })
  declare notes: string | null;

  @BelongsTo(() => Client, {
    foreignKey: 'clientId',
    as: 'client',
  })
  declare client?: Client;

  @BelongsTo(() => User, {
    foreignKey: 'collectedBy',
    as: 'collector',
  })
  declare collector?: User;

  toJSON(): Record<string, unknown> {
    const values = { ...this.get() };
    return values;
  }
}
