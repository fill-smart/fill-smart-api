import { BaseModel } from "../../../core/models/base.model";
import { Wallet } from "./wallet.model";
import {
    Entity,
    Column,
    OneToOne,
    OneToMany,
    JoinColumn,
    ManyToOne,
} from "typeorm";


export enum TransferTypeEnum {
    In = "in",
    Out = "out"
}

@Entity()
export class Transfer extends BaseModel {
    @Column("datetime", {nullable: false})
    stamp: Date = new Date();

    @Column("double")
    litres: number = 0;

    @Column("varchar")
    type: TransferTypeEnum = TransferTypeEnum.In;

    @ManyToOne(_ => Wallet, {nullable: false})
    wallet?: Promise<Wallet>;

    @OneToOne(_ => Transfer, "transfer")
    @JoinColumn()
    transfer?: Promise<Transfer>;
}
