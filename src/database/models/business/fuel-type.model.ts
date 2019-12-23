import { Entity, Column, EntityManager, getManager } from "typeorm";
import { BaseModel } from "../base.model";

@Entity()
export class FuelType extends BaseModel {
    @Column("varchar")
    name: string = "";

    static async getAll(em?: EntityManager): Promise<FuelType[]> {
        const manager = em ?? getManager();
        return manager
            .getRepository(FuelType)
            .createQueryBuilder()
            .getMany();
    }
}
