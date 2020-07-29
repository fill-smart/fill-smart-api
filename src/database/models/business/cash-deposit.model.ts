import { Entity, Column, ManyToOne } from "typeorm";
import { BaseModel } from "./../../../core/models/base.model";
import { GasStation } from "./gas-station.model";

@Entity()
export class CashDeposit extends BaseModel {
  @Column("datetime")
  stamp: Date = new Date();

  @Column("double")
  amount: number = 0;

  @Column("varchar")
  receipt: string = "";

  @ManyToOne(_ => GasStation)
  gasStation?: Promise<GasStation>;
}
