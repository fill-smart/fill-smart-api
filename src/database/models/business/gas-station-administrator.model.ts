import { GasStation } from "./gas-station.model";
import { BaseModel } from "./../../../core/models/base.model";
import {
    Entity,
    Column,
    EntityManager,
    getManager,
    ManyToOne,
    OneToOne,
    JoinColumn
} from "typeorm";
import { User } from "./user.model";

@Entity()
export class GasStationAdministrator extends BaseModel {
    @Column("varchar")
    name: string = "";

    @ManyToOne(_ => GasStation, "gasStation")
    gasStation?: Promise<GasStation>;

    @OneToOne(_ => User, "user")
    @JoinColumn()
    user?: Promise<User>;
}
