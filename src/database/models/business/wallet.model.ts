import { Customer } from "./customer.model";
import { FuelType } from "./fuel-type.model";
import {
    Entity,
    Column,
    ManyToOne,
    OneToMany,
    EntityManager,
    getManager
} from "typeorm";
import { BaseModel } from "../base.model";
import { Operation } from "./operation.model";

@Entity()
export class Wallet extends BaseModel {
    @Column("double")
    litres: number = 0;

    @ManyToOne(_ => FuelType)
    fuelType?: Promise<FuelType>;

    @ManyToOne(_ => Customer)
    customer?: Promise<Customer>;

    @OneToMany(_ => Operation, "wallet")
    operations?: Promise<Operation[]>;

    public static getByCustomerAndFuelType(
        customerId: number,
        fuelTypeId: number,
        em?: EntityManager
    ) {
        const manager = em ?? getManager();
        return manager
            .getRepository(Wallet)
            .createQueryBuilder("w")
            .leftJoin("w.customer", "c")
            .leftJoin("w.fuelType", "ft")
            .where("ft.id = :fuelTypeId", { fuelTypeId })
            .andWhere("c.id = :customerId", { customerId })
            .getOne();
    }
}
