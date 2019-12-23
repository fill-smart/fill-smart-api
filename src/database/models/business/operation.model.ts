import { GasStation } from "./gas-station.model";
import { FuelPrice } from "./fuel-price.model";
import { FuelType } from "./fuel-type.model";
import { OperationType } from "./operation-type.model";
import { Wallet } from "./wallet.model";
import { Entity, Column, ManyToOne } from "typeorm";
import { BaseModel } from "../base.model";

export enum OperationStatusEnum {
    Completed = "completed",
    Pending = "peding"
}

export enum PaymentMethodsEnum {
    Cash = "cash",
    Mercadopago = "mercadopago"
}

@Entity()
export class Operation extends BaseModel {
    @Column("datetime")
    stamp: Date = new Date();

    @Column("double")
    litres: number = 0;

    @Column("varchar")
    status: OperationStatusEnum = OperationStatusEnum.Pending;

    @Column("varchar", { nullable: true })
    externalId: string | null = null;

    @Column("varchar", { nullable: true })
    paymentMethod: PaymentMethodsEnum | null = null;

    @ManyToOne(_ => Wallet)
    wallet?: Promise<Wallet>;

    @ManyToOne(_ => OperationType)
    operationType?: Promise<OperationType>;

    @ManyToOne(_ => FuelType)
    fuelType?: Promise<FuelType>;

    @ManyToOne(_ => FuelPrice)
    fuelPrice?: Promise<FuelPrice>;

    @ManyToOne(_ => GasStation)
    gasStation?: Promise<GasStation>;
}
