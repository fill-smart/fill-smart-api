import { FuelType } from "./fuel-type.model";
import { Entity, Column, ManyToOne, EntityManager, getManager } from "typeorm";
import { BaseModel } from "../base.model";

@Entity()
export class FuelPrice extends BaseModel {
    @Column("datetime")
    from: Date = new Date();

    @Column("datetime", { nullable: true })
    to: Date | null = null;

    @Column("double")
    price: Number = 0;

    @ManyToOne(_ => FuelType)
    fuelType?: Promise<FuelType>;

    public static getCurrentByFuelType(fuelTypeId: number, em?: EntityManager) {
        const now = new Date();
        const manager = em ?? getManager();
        return manager
            .getRepository(this)
            .createQueryBuilder("p")
            .leftJoin("p.fuelType", "ft")
            .where("ft.id = :fuelTypeId", { fuelTypeId })
            .andWhere("p.from <= :now", { now })
            .andWhere("p.to is null or p.to >= :now", { now })
            .getOne();
    }
}
