import { Purchase } from './purchase.model';
import { ShopPurchase } from "./shop-purchase.model";
import { CashWithdrawal } from "./cash-withdrawal.model";
import { Refuel } from "./refuel.model";
import { BaseModel } from "./../../../core/models/base.model";
import { Entity, Column, ManyToOne, OneToOne } from "typeorm";
import { Seller } from "./seller.model";

export enum AuthorizationStatusEnum {
    Pending = "pending",
    Authorized = "authorized",
    Rejected = "rejected"
}

@Entity()
export class Authorization extends BaseModel {
    @Column("datetime")
    stamp: Date = new Date();

    @ManyToOne(_ => Seller, { nullable: true })
    seller?: Promise<Seller>;

    @Column("varchar")
    status: AuthorizationStatusEnum = AuthorizationStatusEnum.Pending;

    @OneToOne(_ => Refuel, "authorization")
    refuel?: Promise<Refuel>;

    @OneToOne(_ => CashWithdrawal, "authorization")
    cashWithdrawal?: Promise<CashWithdrawal>;

    @OneToOne(_ => ShopPurchase, "authorization")
    shopPurchase?: Promise<ShopPurchase>;

    @OneToOne(_ => Purchase, "authorization")
    purchase?: Promise<Purchase>;
}
