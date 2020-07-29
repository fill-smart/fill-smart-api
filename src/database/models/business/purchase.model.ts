import { GasStation } from "./gas-station.model";
import { FuelPrice } from "./fuel-price.model";
import { Wallet } from "./wallet.model";
import { Entity, Column, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import { BaseModel } from "./../../../core/models/base.model";
import { Authorization } from "./authorization.model";

export enum PurchaseStatusEnum {
    Completed = "completed",
    Pending = "pending",
    Canceled = "canceled",
    ChargedBack = "charged_back"
}

export enum PaymentMethodsEnum {
    Cash = "cash",
    Mercadopago = "mercadopago"
}

@Entity()
export class Purchase extends BaseModel {
    @Column("datetime")
    stamp: Date = new Date();

    @Column("double")
    litres: number = 0;

    @Column("varchar")
    status: PurchaseStatusEnum = PurchaseStatusEnum.Pending;

    @Column("varchar", { nullable: true })
    paymentMethod: PaymentMethodsEnum | null = null;

    @ManyToOne(_ => Wallet)
    wallet?: Promise<Wallet>;

    @ManyToOne(_ => FuelPrice)
    fuelPrice?: Promise<FuelPrice>;

    @Column("varchar")
    preferenceId: string = "";

    @Column("varchar")
    preferenceUrl: string = "";

    @Column("bigint", { nullable: true })
    mpPaymentId: number | null = null;

    @Column("varchar", { nullable: true })
    mpPaymentMethodId: string | null = null;

    @Column("varchar", { nullable: true })
    mpPaymentTypeId: string | null = null;

    @Column("varchar", { nullable: true })
    mpStatus: string | null = null;

    @Column("varchar", { nullable: true })
    mpStatusDetail: string | null = null;

    @Column("varchar", { nullable: true })
    mpOperationType: string | null = null;

    @Column("text", { nullable: true })
    mpPaymentData: string | null = null;

    @Column("text", { nullable: true })
    mpChargedBackPaymentData: string | null = null;

    @Column("double", { nullable: true })
    mpTransactionAmount: number | null = null;

    @Column("double", { nullable: true })
    mpNetReceivedAmount: number | null = null;

    @Column("double", { nullable: true })
    mpFeeAmount: number | null = null;

    @OneToOne(_ => Authorization, { nullable: true })
    @JoinColumn()
    authorization?: Promise<Authorization>;

    @ManyToOne(_ => GasStation, { nullable: true })
    gasStation?: Promise<GasStation>;
}
