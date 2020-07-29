import { GasStation } from "./gas-station.model";
import { Entity, Column, OneToMany, ManyToOne } from "typeorm";
import { BaseModel } from "./../../../core/models/base.model";
import { FuelType } from "./fuel-type.model";

@Entity()
export class GasTank extends BaseModel {
    @Column("varchar")
    externalId: string = "";

    @ManyToOne(_ => GasStation, "tanks")
    gasStation?: Promise<GasStation>;

    @ManyToOne(_ => FuelType)
    fuelType?: Promise<FuelType>;

    @Column("double")
    litres: number = 0;
}
