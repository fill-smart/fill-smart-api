import { FuelPrice } from "./fuel-price.model";
import { Wallet } from "./wallet.model";
import { Entity, Column, ManyToOne, Index } from "typeorm";
import { BaseModel } from "./../../../core/models/base.model";

@Entity()
export class FuelExchange extends BaseModel {
  @Index()
  @Column("datetime")
  stamp: Date = new Date();

  @Column("double")
  targetLitres: number = 0;

  @ManyToOne(_ => Wallet)
  sourceWallet?: Promise<Wallet>;

  @ManyToOne(_ => Wallet)
  targetWallet?: Promise<Wallet>;

  @ManyToOne(_ => FuelPrice)
  sourceFuelPrice?: Promise<FuelPrice>;

  @ManyToOne(_ => FuelPrice)
  targetFuelPrice?: Promise<FuelPrice>;
}
