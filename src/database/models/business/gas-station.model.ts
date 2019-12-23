import { Operation } from "./operation.model";
import { Wallet } from "./wallet.model";
import { User } from "./user.model";
import { Entity, Column, OneToMany } from "typeorm";
import { BaseModel } from "../base.model";

@Entity()
export class GasStation extends BaseModel {
    @Column("varchar")
    name: string = "";

    @Column("double")
    lat: number = 0;

    @Column("double")
    lng: number = 0;

    @Column("varchar")
    address: string = "";

    @OneToMany(_ => Operation, "gasStation")
    operations?: Promise<Operation[]>;
}
