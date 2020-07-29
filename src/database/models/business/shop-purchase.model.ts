import { Seller } from "./seller.model";
import { FuelPrice } from "./fuel-price.model";
import { Wallet } from "./wallet.model";
import { Entity, Column, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import { BaseModel } from "./../../../core/models/base.model";
import { Authorization } from "./authorization.model";
import { GasStation } from "./gas-station.model";


@Entity()
export class ShopPurchase extends BaseModel {
    @Column("datetime")
    stamp: Date = new Date();

    @Column("double")
    litres: number = 0;

    @ManyToOne(_ => Wallet)
    wallet?: Promise<Wallet>;

    @ManyToOne(_ => FuelPrice)
    fuelPrice?: Promise<FuelPrice>;

    @ManyToOne(_ => GasStation)
    gasStation?: Promise<GasStation>;

    @Column("varchar")
    description: string = "";

    @OneToOne(_ => Authorization)
    @JoinColumn()
    authorization?: Promise<Authorization>;


}
