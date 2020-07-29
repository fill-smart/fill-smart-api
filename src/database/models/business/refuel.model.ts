import { FuelPrice } from "./fuel-price.model";
import { Wallet } from "./wallet.model";
import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index
} from "typeorm";
import { BaseModel } from "./../../../core/models/base.model";
import { FuelType } from "./fuel-type.model";
import { Pump } from "./pump.model";
import { Authorization } from "./authorization.model";

@Entity()
export class Refuel extends BaseModel {
  @Column("datetime")
  @Index()
  stamp: Date = new Date();

  @Column("double")
  litres: number = 0;

  @ManyToOne(_ => FuelType)
  fuelType?: Promise<FuelType>;

  @ManyToOne(_ => FuelPrice)
  fuelPrice?: Promise<FuelPrice>;

  @ManyToOne(_ => Pump)
  pump?: Promise<Pump>;

  @Column("varchar", { nullable: true })
  externalId: string | null = null;

  @ManyToOne(_ => Wallet)
  wallet?: Promise<Wallet>;

  @ManyToOne(_ => FuelPrice)
  walletFuelPrice?: Promise<FuelPrice>;

  @Column("double")
  walletLitres: number = 0;

  @OneToOne(_ => Authorization)
  @JoinColumn()
  authorization?: Promise<Authorization>;
}
