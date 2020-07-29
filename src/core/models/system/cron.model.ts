import { BaseModel } from "./../base.model";
import { Entity, Column } from "typeorm";

@Entity()
export class Cron extends BaseModel {
    @Column("varchar")
    expression: string = "";

    @Column("varchar")
    name: string = "";

    @Column("text")
    description: string = "";

    @Column("bool")
    active: boolean = true;
}
