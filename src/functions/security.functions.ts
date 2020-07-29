import { Seller } from "./../database/models/business/seller.model";
import { GasStationAdministrator } from "./../database/models/business/gas-station-administrator.model";
import { EntityToGraphResolver } from "../core/entity-resolver";
import { RolesEnum, Role } from "../database/models/business/role.model";
import bcrypt from "bcryptjs";
import { getCurrentEnvironmentalConfig } from "../core/env/env";
import { User } from "../database/models/business/user.model";
import { getManager } from "typeorm";
import jwt from "jsonwebtoken";
import {
  getInfoFromSubfield,
  GraphQLPartialResolveInfo
} from "../core/gql/utils";
import { GraphQLResolveInfo } from "graphql";
import { GasStation } from "../database/models/business/gas-station.model";
import { NumberUtils } from "@silentium-apps/fill-smart-common";
import Mailer from "../core/mailing/mailer";

export interface IUserCreateInput {
  username: string;
  name: string;
  role: RolesEnum;
  password: string;
  gasStationId?: number;
}

export interface IRequestResetPasswordCodeInput {
  username: string;
}

export interface IRequestResetPasswordCodeResult {
  success: boolean;
}

export interface IResetPasswordInput {
  username: string;
  code: string;
  newPassword: string;
}

export interface IResetPasswordResult {
  success: boolean;
}

export interface IChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface IChangePasswordResult {
  success: boolean;
}

export const SecurityFunctions = {
  createUser: async (
    data: IUserCreateInput,
    context: { user: IDecodedToken },
    info: GraphQLResolveInfo
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
        await getManager().transaction(async em => {
          switch (data.role) {
            case RolesEnum.Administrator: {
              console.log("**create admin**");
              //Only administrator can create another administrator
              if (!context.user.roles.includes(RolesEnum.Administrator)) {
                throw `Must be administrator`;
              }
              const adminRole = await Role.getByName(
                RolesEnum.Administrator,
                em
              );
              const admin = new User();
              admin.roles = Promise.resolve([adminRole]);
              admin.username = data.username;
              admin.password = await bcrypt.hash(data.password, 10);
              const savedAdmin = await em.save(admin);
              resolve(
                EntityToGraphResolver.find<User>(savedAdmin.id as number, User, info)
              );
              break;
            }
            case RolesEnum.CoverageOperator: {
              console.log("**create coverage operator**");
              //Only administrator can create a coverage operator
              if (!context.user.roles.includes(RolesEnum.Administrator)) {
                throw `Must be administrator`;
              }
              const coverageOperatorRole = await Role.getByName(
                RolesEnum.CoverageOperator,
                em
              );
              const coverageOperator = new User();
              coverageOperator.roles = Promise.resolve([coverageOperatorRole]);
              coverageOperator.username = data.username;
              coverageOperator.password = await bcrypt.hash(data.password, 10);
              const savedCoverageOperator = await em.save(coverageOperator);
              resolve(
                EntityToGraphResolver.find<User>(
                  savedCoverageOperator.id as number,
                  User,
                  info
                )
              );
              break;
            }
            case RolesEnum.GasStationAdministrator: {
              console.log("**create gs admin**");
              //Only administrator can create a gas station administrator
              if (!context.user.roles.includes(RolesEnum.Administrator)) {
                throw `Must be administrator`;
              }
              const gasStationAdminRole = await Role.getByName(
                RolesEnum.GasStationAdministrator,
                em
              );
              const gasStationAdminUser = new User();
              gasStationAdminUser.roles = Promise.resolve([
                gasStationAdminRole
              ]);
              gasStationAdminUser.username = data.username;
              gasStationAdminUser.password = await bcrypt.hash(
                data.password,
                10
              );
              const savedGasStationAdminUser = await em.save(
                gasStationAdminUser
              );
              const gasStationAdmin = new GasStationAdministrator();
              gasStationAdmin.user = Promise.resolve(savedGasStationAdminUser);
              gasStationAdmin.name = data.name;
              const gasStation = <GasStation | undefined>(
                await GasStation.getById(data.gasStationId as number)
              );
              if (!gasStation) {
                throw "No gas station found for such id";
              }
              gasStationAdmin.gasStation = Promise.resolve(gasStation);
              await em.save(gasStationAdmin);
              resolve(
                EntityToGraphResolver.find<User>(
                  savedGasStationAdminUser.id as number,
                  User,
                  info
                )
              );
              break;
            }
            case RolesEnum.Seller: {
              console.log("**create seller**");
              //Only gas station administrator can create a seller
              if (
                !context.user.roles.includes(RolesEnum.GasStationAdministrator)
              ) {
                throw `Must be gas station administrator`;
              }
              const sellerRole = await Role.getByName(RolesEnum.Seller, em);
              const sellerUser = new User();
              sellerUser.roles = Promise.resolve([sellerRole]);
              sellerUser.username = data.username;
              sellerUser.password = await bcrypt.hash(data.password, 10);
              const savedSellerUser = await em.save(sellerUser);
              const seller = new Seller();
              seller.user = Promise.resolve(savedSellerUser);
              seller.name = data.name;
              const gasStation = <GasStation | undefined>(
                await GasStation.getById(data.gasStationId as number)
              );
              if (!gasStation) {
                throw "No gas station found for such id";
              }
              seller.gasStation = Promise.resolve(gasStation);
              await em.save(seller);
              resolve(
                EntityToGraphResolver.find<User>(savedSellerUser.id as number, User, info)
              );
              break;
            }
          }
        });
      } catch (e) {
        console.log("Error: ", e);
        reject(e);
      }
    });
  },
  login: async (
    data: ILoginRequest,
    info: GraphQLResolveInfo
  ): Promise<ILoginResult> => {
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
        const passwordIsValid = await bcrypt.compare(
          data.password,
          user.password
        );
        if (passwordIsValid) {
          const secretTokeSign = (await getCurrentEnvironmentalConfig())
            .secretToken;
          const subinfo = <GraphQLPartialResolveInfo>(
            getInfoFromSubfield("user", info)
          );
          const populatedCustomer = <User>(
            await EntityToGraphResolver.find<User>(user.id as number, User, subinfo, em)
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
  },
  requestResetPasswordCode: async (
    data: IRequestResetPasswordCodeInput
  ): Promise<IRequestResetPasswordCodeResult> => {
    return new Promise<IRequestResetPasswordCodeResult>(
      async (resolve, reject) => {
        try {
          await getManager().transaction(async em => {
            const { username } = data;
            const user = await em
              .getRepository(User)
              .createQueryBuilder("u")
              .where("u.username = :username", { username })
              .getOne();
            if (!user) {
              throw "username does not match any user";
            }
            const resetPasswordCode = NumberUtils.randomBetween(0, 9999)
              .toString()
              .padStart(4, "0");
            user.resetPasswordCode = resetPasswordCode;
            await Mailer.sendPasswordResetCode(
              resetPasswordCode,
              data.username
            );
            await em.save(user);
            resolve({
              success: true
            });
          });
        } catch (e) {
          reject(e);
        }
      }
    );
  },
  resetPassword: async (
    data: IResetPasswordInput
  ): Promise<IResetPasswordResult> => {
    return new Promise<IResetPasswordResult>(async (resolve, reject) => {
      try {
        await getManager().transaction(async em => {
          const { username, code, newPassword } = data;
          const user = await em
            .getRepository(User)
            .createQueryBuilder("u")
            .where("u.username = :username", { username })
            .getOne();
          if (!user) {
            throw "username does not match any user";
          }
          if (user.resetPasswordCode !== code) {
            throw "code incorrect";
          }
          user.password = await bcrypt.hash(newPassword, 10);
          await em.save(user);
          resolve({
            success: true
          });
        });
      } catch (e) {
        reject(e);
      }
    });
  },
  changePassword: async (
    data: IChangePasswordInput,
    context: { user: IDecodedToken }
  ): Promise<IChangePasswordResult> => {
    return new Promise<IResetPasswordResult>(async (resolve, reject) => {
      try {
        await getManager().transaction(async em => {
          const { currentPassword, newPassword } = data;
          const user = await em
            .getRepository(User)
            .createQueryBuilder("u")
            .where("u.id = :id", { id: context.user.id })
            .getOne();
          if (!user) {
            throw "username does not match any user";
          }
          if (!(await bcrypt.compare(currentPassword, user.password))) {
            throw "current password does not match";
          }
          const hashedNewPassword = await encryptPassword(newPassword);
          user.password = hashedNewPassword;
          await em.save(user);
          resolve({
            success: true
          });
        });
      } catch (e) {
        reject(e);
      }
    });
  },
  mustBeAuthenticated: (context: { user: IDecodedToken }) => {
    if (!context.user) {
      throw "Must provide credentials";
    }
  },
  mustHaveRole: (context: { user: IDecodedToken }, ...roles: RolesEnum[]) => {
    if (!context.user.roles.some(r => roles.includes(r))) {
      throw `Must be ${roles}`;
    }
  }
};
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
    const secretTokeSign = (await getCurrentEnvironmentalConfig()).secretToken;
    return <IDecodedToken>jwt.verify(token, secretTokeSign);
  } catch (e) {
    throw e;
  }
};

export const encryptPassword = async (unencripted: string): Promise<string> => {
  return await bcrypt.hash(unencripted, 10);
};
