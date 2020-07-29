import { BaseModel } from "./../../../core/models/base.model";
import { User } from "./user.model";
import { Entity, Column, JoinColumn, ManyToOne } from "typeorm";

export enum FcmTokenStatusEnum {
    Active = "active",
    Inactive = "inactive"
}

@Entity()
export class FcmToken extends BaseModel {
    @Column("varchar")
    token: string = "";

    @Column("varchar")
    status: FcmTokenStatusEnum = FcmTokenStatusEnum.Active;

    @ManyToOne(_ => User, "fcmTokens")
    @JoinColumn()
    user?: Promise<User>;
}
