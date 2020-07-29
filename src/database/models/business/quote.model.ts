import { InvestmentType } from "./investment-type.model";
import { Entity, Column, ManyToOne } from "typeorm";
import { BaseModel } from "./../../../core/models/base.model";

@Entity()
export class Quote extends BaseModel {
    @ManyToOne(_ => InvestmentType)
    investmentType?: Promise<InvestmentType>;

    @Column("double")
    price: number = 0;

    @Column("datetime")
    from: Date = new Date();

    @Column("datetime", { nullable: true })
    to: Date | null = null;

    @ManyToOne(_ => Quote, { nullable: true })
    parentQuote?: Promise<Quote>;

    get arsEquivalent(): Promise<number> {
        return new Promise(async (resolve, reject) => {
            if (!this.parentQuote || !(await this.parentQuote)) {
                return resolve(this.price as number);
            } else {
                return resolve(
                    this.price * (await (await this.parentQuote).arsEquivalent)
                );
            }
        });
    }
}
