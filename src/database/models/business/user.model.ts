import { CoverageOperator } from './coverage_operator.model';
import { FcmToken } from "./fcm-token.model";
import { GasStationAdministrator } from "./gas-station-administrator.model";
import { Seller } from "./seller.model";
import { Customer } from "./customer.model";
import { Role } from "./role.model";
import {
  Entity,
  Column,
  ManyToMany,
  JoinTable,
  OneToOne,
  OneToMany
} from "typeorm";
import { BaseModel } from "./../../../core/models/base.model";
import { TransferWithdrawal } from './transfer-withdrawal.model';

@Entity()
export class User extends BaseModel {
  @Column("varchar", { unique: false })
  username: string = "";

  @Column("varchar")
  password: string = "";

  @Column("varchar")
  resetPasswordCode: string = "";

  @ManyToMany(type => Role)
  @JoinTable()
  roles?: Promise<Role[]>;

  @OneToOne(_ => Customer, "user")
  customer?: Promise<Customer>;

  @OneToOne(_ => Seller, "user")
  seller?: Promise<Seller>;

  @OneToOne(_ => GasStationAdministrator, "user")
  gasStationAdministrator?: Promise<Seller>;

  @OneToOne(_ => CoverageOperator, "user")
  coverageOperator?: Promise<CoverageOperator>;

  @OneToMany(_ => FcmToken, "user")
  fcmTokens?: Promise<FcmToken[]>;

  @OneToMany(_ => TransferWithdrawal, "transfer")
  authorizedTransfers?: Promise<TransferWithdrawal[]>;
}
