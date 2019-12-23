import { DocumentType } from './document-type.model';
import { Image } from "./image.model";
import { Entity, Column, ManyToOne, ManyToMany } from "typeorm";
import { BaseModel } from "../base.model";
import { Customer } from './customer.model';

@Entity()
export class Document extends BaseModel {
    @Column("varchar")
    name: string = "";

    @Column("varchar")
    documentData: string = "";

    @ManyToOne(_ => Image)
    image?: Promise<Image>;

    @ManyToOne(_ => DocumentType)
    documentType?: Promise<DocumentType>;

    @ManyToMany(_ => Customer)
    customer?: Promise<Customer>;

}
