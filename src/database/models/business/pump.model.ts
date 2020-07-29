import { Refuel } from "./refuel.model";
import { GasStation } from "./gas-station.model";
import { Entity, Column, ManyToOne, OneToMany } from "typeorm";
import { BaseModel } from "./../../../core/models/base.model";

@Entity()
export class Pump extends BaseModel {
    @Column("varchar")
    externalId: string = "";

    @ManyToOne(_ => GasStation)
    gasStation?: Promise<GasStation>;

    @OneToMany(_ => Refuel, "pump")
    refuels?: Promise<Refuel[]>;
}
