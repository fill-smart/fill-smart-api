import { FuelType } from "./fuel-type.model";
import { GasStation } from "./gas-station.model";
import { Entity, ManyToOne, Column } from "typeorm";
import { BaseModel } from "./../../../core/models/base.model";

@Entity()
export class GasStationFuelTypeMap extends BaseModel {
  @ManyToOne(_ => GasStation, "fuelTypesMap")
  gasStation?: Promise<GasStation>;

  @ManyToOne(_ => FuelType)
  fuelType?: Promise<FuelType>;

  @Column("varchar")
  externalCode: string = "";
}
