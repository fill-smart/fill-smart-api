import { Customer } from "./customer.model";
import { Role } from "./role.model";
import { Entity, Column, ManyToMany, JoinTable, OneToOne } from "typeorm";
import { BaseModel } from "../base.model";

@Entity()
export class User extends BaseModel {
    @Column("varchar", { unique: true })
    username: string = "";

    @Column("varchar", { select: false })
    password: string = "";

    @ManyToMany(type => Role)
    @JoinTable()
    roles?: Promise<Role[]>;

    @OneToOne(_ => Customer, "user")
    customer?: Promise<Customer>;
}
