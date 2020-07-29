import { GasStationFuelTypeMap } from "./gas-station-fuel-type-map.model";
import { Pump } from "./pump.model";
import { Seller } from "./seller.model";
import { Entity, Column, OneToMany } from "typeorm";
import { BaseModel } from "./../../../core/models/base.model";
import { GasTank } from "./gas-tank.model";

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

  @Column("varchar", { nullable: false })
  externalWSUrl: string = "";

  @OneToMany(_ => Seller, "gasStation")
  sellers?: Promise<Seller[]>;

  @OneToMany(_ => GasStationFuelTypeMap, "gasStation")
  fuelTypesMap?: Promise<GasStationFuelTypeMap[]>;

  @OneToMany(_ => Pump, "gasStation")
  pumps?: Promise<Pump[]>;

  @OneToMany(_ => GasTank, "gasStation")
  gasTanks?: Promise<GasTank[]>;

  @Column("boolean")
  purchaseRequireAuthorization: boolean = false;
}
