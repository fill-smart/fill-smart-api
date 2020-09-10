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
import { TransferWithdrawal } from "./transfer-withdrawal.model";

@Entity()
export class TransferWithdrawalAttachment extends BaseModel {
    @Column("varchar")
    filename: string = "";

    @Column("varchar")
    mimetype: string = "";

    @Column("varchar")
    encoding: string = "";

    @Column("varchar")
    path: string = "";

    @ManyToOne(_ => TransferWithdrawal)
    TransferWithdrawal?: Promise<TransferWithdrawal>;
}
