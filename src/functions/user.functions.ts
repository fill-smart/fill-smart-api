import {
    FcmToken,
    FcmTokenStatusEnum
} from "./../database/models/business/fcm-token.model";
import { getManager } from "typeorm";
import { IDecodedToken, decodeToken } from "./security.functions";
import { User } from "../database/models/business/user.model";

export interface IRegisterTokenInput {
    token: string;
}

export interface IUnregisterTokenInput {
    token: string;
    jwt: string;
}

export interface IRegisterOrUnregisterTokenResult {
    success: boolean;
}


export const UserFunctions = {
    registerFcmToken: async (
        data: IRegisterTokenInput,
        context: { user: IDecodedToken }
    ) => {
        return new Promise<IRegisterOrUnregisterTokenResult>(
            async (resolve, reject) => {
                try {
                    await getManager().transaction(async em => {
                        const user = <User>await User.getById(context.user.id);
                        const status = FcmTokenStatusEnum.Active;
                        const existentToken = await em
                            .createQueryBuilder(FcmToken, "t")
                            .leftJoin("t.user", "u")
                            .where("u.id = :userId", {
                                userId: context.user.id
                            })
                            .andWhere("t.token = :token", { token: data.token })
                            .andWhere("t.status = :status", { status })
                            .getOne();
                        //If the token already exists we return success
                        if (existentToken) {
                            return resolve({
                                success: true
                            });
                        }
                        const fcmToken = new FcmToken();
                        fcmToken.token = data.token;
                        fcmToken.status = FcmTokenStatusEnum.Active;
                        fcmToken.user = Promise.resolve(user);
                        await em.save(fcmToken);
                        return resolve({
                            success: true
                        });
                    });
                } catch (ex) {
                    reject(ex);
                }
            }
        );
    },
    unregisterFcmToken: async (
        data: IUnregisterTokenInput,
        { user }: { user: IDecodedToken }
    ) => {
        return new Promise<IRegisterOrUnregisterTokenResult>(
            async (resolve, reject) => {
                try {
                    await getManager().transaction(async em => {
                        const status = FcmTokenStatusEnum.Active;
                        const existentToken = await em
                            .createQueryBuilder(FcmToken, "t")
                            .leftJoin("t.user", "u")
                            .where("u.id = :userId", {
                                userId: user.id
                            })
                            .andWhere("t.token = :token", { token: data.token })
                            .andWhere("t.status = :status", { status })
                            .getOne();
                        //If the token does not exists we return success
                        if (!existentToken) {
                            return resolve({
                                success: true
                            });
                        }
                        existentToken.status = FcmTokenStatusEnum.Inactive;

                        await em.save(existentToken);
                        return resolve({
                            success: true
                        });
                    });
                } catch (ex) {
                    reject(ex);
                }
            }
        );
    }
};
