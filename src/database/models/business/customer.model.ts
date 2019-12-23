import { Wallet } from "./wallet.model";
import { User } from "./user.model";
import {
    Entity,
    Column,
    OneToOne,
    ManyToOne,
    OneToMany,
    JoinColumn,
    EntityManager,
    getManager
} from "typeorm";
import { BaseModel } from "../base.model";

export enum AccountStatusEnum {
    Active = "active",
    Inactive = "inactive"
}

@Entity()
export class Customer extends BaseModel {
    @Column("varchar")
    firstName: string = "";

    @Column("varchar")
    lastName: string = "";

    @Column("varchar", { unique: true })
    documentNumber: string = "";

    @Column("datetime")
    born: Date = new Date();

    @Column("varchar")
    phone: string = "";

    @Column("varchar", { unique: true })
    email: string = "";

    @Column("varchar")
    status: AccountStatusEnum = AccountStatusEnum.Inactive;

    @OneToOne(_ => User, "customer")
    @JoinColumn()
    user?: Promise<User>;

    @OneToMany(_ => Wallet, "customer")
    wallets?: Promise<Wallet[]>;

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
