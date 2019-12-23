import { Entity, Column, EntityManager, getManager } from "typeorm";
import { BaseModel } from "../base.model";

export enum OperationTypesEnum {
    Recarga = "Recarga",
    ExtraccionEfectivo = "Extraccion Efectivo",
    CompraDeCombustible = "Compra de Combustible",
    CompraEnShop = "Compra en Shop",
    CanjeDeCombustible = "Canje de Combustible"
}

@Entity()
export class OperationType extends BaseModel {
    @Column("varchar")
    name: string = "";

    public static getByName(name: OperationTypesEnum, em?: EntityManager) {
        const manager = em ?? getManager();
        return manager
            .getRepository(this)
            .createQueryBuilder("ot")
            .where("ot.name = :name", { name })
            .getOne();
    }
}
