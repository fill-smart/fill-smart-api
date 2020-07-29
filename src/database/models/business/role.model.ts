import { Column, Entity, EntityManager, getManager } from "typeorm";
import { BaseModel } from "./../../../core/models/base.model";

@Entity()
export class Role extends BaseModel {
    @Column("varchar")
    name: string = "";

    static getByName = async (role: RolesEnum, em?: EntityManager) => {
        const manager = em ?? getManager();
        return <Promise<Role>>manager
            .getRepository(Role)
            .createQueryBuilder()
            .where("name = :role", { role })
            .getOne();
    };
}

export enum RolesEnum {
    Administrator = "administrator",
    Customer = "customer",
    Seller = "seller",
    GasStationAdministrator = "gas_station_administrator",
    CoverageOperator = "coverage_operator"
}
