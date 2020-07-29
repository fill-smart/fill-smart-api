import { DocumentType } from './document-type.model';
import { Image } from "./image.model";
import { Entity, Column, ManyToOne, ManyToMany, OneToOne } from "typeorm";
import { BaseModel } from './../../../core/models/base.model';
import { Customer } from './customer.model';

@Entity()
export class Document extends BaseModel {
    @Column("varchar")
    name: string = "";

    @Column("varchar")
    documentData: string = "";

    @OneToOne(_ => Image, "document")
    image?: Promise<Image>;

    @ManyToOne(_ => DocumentType)
    documentType?: Promise<DocumentType>;

    @ManyToOne(_ => Customer)
    customer?: Promise<Customer>;

}
