import { Entity, Column } from "typeorm";
import { BaseModel } from "../base.model";

@Entity()
export class DocumentType extends BaseModel {
    @Column("varchar")
    name: string = "";
}
