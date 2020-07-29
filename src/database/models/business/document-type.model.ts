import { Entity, Column, EntityManager, getManager } from "typeorm";
import { BaseModel } from "./../../../core/models/base.model";

export enum DocumentTypesEnum {
    DniFront = "Frente DNI",
    DniBack = "Dorso DNI"
}

@Entity()
export class DocumentType extends BaseModel {
    @Column("varchar")
    name: string = "";

    public static getByDocumentName(
        name: string,        
        em?: EntityManager
    ) {
        const manager = em ?? getManager();
        return manager
            .getRepository(DocumentType)
            .createQueryBuilder("d")            
            .where("d.name = :name", { name })            
            .getOne();
    }
}
