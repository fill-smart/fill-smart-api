import { Document } from "./document.model";
import { BaseModel } from "../../../core/models/base.model";
import { Wallet } from "./wallet.model";
import { User } from "./user.model";
import {
    Entity,
    Column,
    OneToOne,
    OneToMany,
    JoinColumn,
    ManyToOne,
} from "typeorm";
import { CashWithdrawal } from "./cash-withdrawal.model";
import { Customer } from "./customer.model";

@Entity()
export class Transfer extends BaseModel {
    @Column("datetime", {nullable: true})
    stamp: Date = new Date();

    @Column("double")
    targetLitres: number = 0;

    @ManyToOne(_ => Wallet)
    sourceWallet?: Promise<Wallet>;

    @ManyToOne(_ => Wallet)
    targetWallet?: Promise<Wallet>;
}
