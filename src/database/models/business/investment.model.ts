import { InvestmentType } from "./investment-type.model";
import { Entity, Column, ManyToOne } from "typeorm";
import { BaseModel } from "./../../../core/models/base.model";
import { Quote } from "./quote.model";

export enum InvestmentMovementTypeEnum {
  Sale = "sale",
  Purchase = "purchase",
}

@Entity()
export class Investment extends BaseModel {
  @ManyToOne((_) => InvestmentType)
  investmentType?: Promise<InvestmentType>;

  @ManyToOne((_) => Quote)
  quote?: Promise<Quote>;

  @Column("varchar")
  movementType: InvestmentMovementTypeEnum =
    InvestmentMovementTypeEnum.Purchase;

  @Column("double")
  ammount: number = 0;

  @Column("datetime")
  stamp: Date = new Date();

  @Column("datetime")
  dueDate: Date = new Date();
}
