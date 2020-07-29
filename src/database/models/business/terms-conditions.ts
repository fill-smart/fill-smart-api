import { Entity, Column } from "typeorm";
import { BaseModel } from "../../../core/models/base.model";

@Entity()
export class TermsConditions extends BaseModel{
    @Column("longtext")
    terms: string = "";
}