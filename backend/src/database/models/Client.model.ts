import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  BelongsToMany,
} from 'sequelize-typescript';
import { Unit } from './Unit.model';
import { Collection } from './Collection.model';
import { LgpdConsent } from './LgpdConsent.model';
import { User } from './User.model';
import { WasteType } from './WasteType.model';
import { ClientWasteType } from './ClientWasteType.model';
import { Recipient } from './Recipient.model';

@Table({
  tableName: 'clients',
  timestamps: true,
  paranoid: true,
})
export class Client extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(18),
    allowNull: false,
    unique: true,
    comment: 'CNPJ or CPF',
  })
  declare document: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  declare phone: string | null;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true,
    },
  })
  declare email: string | null;

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

  @HasMany(() => Unit, {
    foreignKey: 'clientId',
    as: 'units',
  })
  declare units?: Unit[];

  @HasMany(() => Collection, {
    foreignKey: 'clientId',
    as: 'collections',
  })
  declare collections?: Collection[];

  @HasMany(() => LgpdConsent, {
    foreignKey: 'clientId',
    as: 'consents',
  })
  declare consents?: LgpdConsent[];

  @HasMany(() => User, {
    foreignKey: 'clientId',
    as: 'clientUsers',
  })
  declare clientUsers?: User[];

  @BelongsToMany(() => WasteType, {
    through: () => ClientWasteType,
    foreignKey: 'clientId',
    otherKey: 'wasteTypeId',
    as: 'wasteTypes',
  })
  declare wasteTypes?: WasteType[];

  @HasMany(() => Recipient, {
    foreignKey: 'clientId',
    as: 'recipients',
  })
  declare recipients?: Recipient[];

  toJSON(): Record<string, unknown> {
    const values = { ...this.get() };
    delete values.deletedAt;
    return values;
  }
}
