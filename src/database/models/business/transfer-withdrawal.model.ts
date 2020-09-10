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
import { TransferWithdrawalAttachment } from "./transfer-withdrawal-attachment.model";

@Entity()
export class TransferWithdrawal extends BaseModel {
    @Column("varchar")
    code: string = "";

    @Column("boolean", { nullable: true })
    authorized: boolean | null = null;

    @Column("datetime", { nullable: true })
    stamp: Date = new Date();

    @Column("varchar")
    accountType: string = "";

    @OneToOne(_ => CashWithdrawal, "withdrawal")
    @JoinColumn()
    withdrawal?: Promise<CashWithdrawal>;

    @ManyToOne(_ => User)
    authorizer?: Promise<User>;

    @OneToMany(_ => TransferWithdrawalAttachment, "transfer_withdrawal")
    TransferWithdrawalAttachments?: Promise<TransferWithdrawalAttachment[]>;
}
