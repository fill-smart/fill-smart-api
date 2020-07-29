import { Authorization } from "./authorization.model";
import { GasStation } from "./gas-station.model";
import { BaseModel } from "./../../../core/models/base.model";
import {
    Entity,
    Column,
    EntityManager,
    getManager,
    ManyToOne,
    OneToOne,
    JoinColumn,
    OneToMany
} from "typeorm";
import { User } from "./user.model";

@Entity()
export class Seller extends BaseModel {
    @Column("varchar")
    name: string = "";

    @ManyToOne(_ => GasStation, "gasStation")
    gasStation?: Promise<GasStation>;

    @OneToMany(_ => Authorization, "seller")
    authorizations?: Promise<Authorization[]>;

    @OneToOne(_ => User, "user")
    @JoinColumn()
    user?: Promise<User>;

    public static getByUser(userId: number, em?: EntityManager) {
        const manager = em ?? getManager();
        return manager
            .getRepository(this)
            .createQueryBuilder("c")
            .leftJoin("c.user", "u")
            .where("u.id = :userId", { userId })
            .getOne();
    }
}
