import { Entity, Column } from "typeorm";
import { BaseModel } from "../base.model";


@Entity()
export class ScheduledMaintenance extends BaseModel {
    @Column("datetime")
    from: Date = new Date();

    @Column("datetime", { nullable: true })
    to: Date | null = null;

    @Column("varchar")
    reason: string = "";
}
