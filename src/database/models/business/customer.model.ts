import { Document } from "./document.model";
import { BaseModel } from "./../../../core/models/base.model";
import { Wallet } from "./wallet.model";
import { User } from "./user.model";
import {
    Entity,
    Column,
    OneToOne,
    OneToMany,
    JoinColumn,
    EntityManager,
    getManager
} from "typeorm";
import fs from "fs";
import { TransferWithdrawal } from "./transfer-withdrawal.model";

export enum AccountStatusEnum {
    Active = "active",
    Inactive = "inactive"
}

@Entity()
export class Customer extends BaseModel {
    @Column("varchar")
    firstName: string = "";

    @Column("varchar")
    lastName: string = "";

    @Column("varchar")
    documentNumber: string = "";

    @Column("datetime")
    born: Date = new Date();

    @Column("varchar")
    phone: string = "";

    @Column("varchar")
    status: AccountStatusEnum = AccountStatusEnum.Inactive;

    @Column("varchar")
    cbu: string = "";
    
    @Column("varchar")
    cbuAlias: string = "";

    @Column("varchar")
    mercadopagoAccount: string = "";

    @OneToOne(_ => User, "customer")
    @JoinColumn()
    user?: Promise<User>;

    @OneToMany(_ => Wallet, "customer")
    wallets?: Promise<Wallet[]>;

    @OneToMany(_ => Document, "customer")
    documents?: Promise<Document[]>;

    @Column("varchar")
    activationCode: string = "";

    get profileImage(): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                fs.readFile(
                    `${__dirname}/../../../uploads/profiles/${this.id}.jpg`,
                    (err, data) => {
                        if (err) {
                            resolve("");
                            return;
                        }
                        resolve(Buffer.from(data).toString("base64"));
                    }
                );
            }
            catch (ex) {
                resolve("");
            }
        });
    }

    public static getByUser(userId: number, em?: EntityManager) {
        const manager = em ?? getManager();
        return manager
            .getRepository(this)
            .createQueryBuilder("c")
            .leftJoin("c.user", "u")
            .where("u.id = :userId", { userId })
            .getOne();
    }
}
