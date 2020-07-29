import { GasStation } from "./gas-station.model";
import { Entity, Column, OneToMany, ManyToOne } from "typeorm";
import { BaseModel } from "./../../../core/models/base.model";
import { FuelType } from "./fuel-type.model";

@Entity()
export class InvestmentType extends BaseModel {
    @Column("varchar")
    name: string = "";
}
