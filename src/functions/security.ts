import { RolesEnum } from "./../database/models/business/role.model";
import bcrypt from "bcrypt";
import { getCurrentEnvironmentalConfig } from "./../env/env";
import { User } from "./../database/models/business/user.model";
import { getManager } from "typeorm";
import jwt from "jsonwebtoken";
import { getInfoFromSubfield } from "../gql/utils";
import { GraphQLResolveInfo } from "graphql";
import { EntityToGraphResolver } from "../database/query-resolver";

export interface ILoginRequest {
    username: string;
    password: string;
}

export interface ILoginResult {
    user: User;
    token: string;
}

export interface IDecodedToken {
    id: number;
    username: string;
    roles: RolesEnum[];
}

export const decodeToken = async (token: string): Promise<IDecodedToken> => {
    try {
        const secretTokeSign = (await getCurrentEnvironmentalConfig())
            .secretToken;
        return <IDecodedToken>jwt.verify(token, secretTokeSign);
    } catch (e) {
        throw e;
    }
};

export const encryptPassword = async (unencripted: string): Promise<string> => {
    return await bcrypt.hash(unencripted, 10);
};

export const login = async (data: ILoginRequest, info:GraphQLResolveInfo): Promise<ILoginResult> => {
    try {
        const em = getManager();
        const username = data.username;
        const user = await em
            .getRepository(User)
            .createQueryBuilder("u")
            .select(["u.id", "u.username", "u.password", "r.name"])
            .leftJoinAndSelect("u.roles", "r")
            .where("u.username = :username", { username })
            .getOne();
        if (user) {
            const thePasswordIsValid = await bcrypt.compare(
                data.password,
                user.password
            );
            if (thePasswordIsValid) {
                const secretTokeSign = (await getCurrentEnvironmentalConfig())
                    .secretToken;
                    const subinfo = getInfoFromSubfield("user", info);
                    const populatedCustomer = <User>(
                        await EntityToGraphResolver.find<User>(
                            user.id,
                            User,
                            subinfo,
                            em
                        )
                    );
                return {
                    user: populatedCustomer,
                    token: jwt.sign(
                        {
                            id: user.id,
                            username: user.username,
                            roles: (await user.roles)?.map(role => role.name)
                        },
                        secretTokeSign
                    )
                };
            } else {
                throw "username and password do not match any existing user";
            }
        } else {
            throw "username and password do not match any existing user";
        }
    } catch (e) {
        throw e;
    }
};
