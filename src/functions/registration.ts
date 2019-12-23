import StringUtils from "./../utils/string-utils";
import {
    Customer,
    AccountStatusEnum
} from "./../database/models/business/customer.model";
import { encryptPassword } from "./security";
import { RolesEnum, Role } from "./../database/models/business/role.model";
import { User } from "./../database/models/business/user.model";
import { FuelType } from "./../database/models/business/fuel-type.model";
import { Wallet } from "./../database/models/business/wallet.model";
import { getManager } from "typeorm";
import { EntityToGraphResolver } from "../database/query-resolver";
import { GraphQLResolveInfo } from "graphql";
import { getInfoFromSubfield } from "../gql/utils";

export interface IRegisterRequest {
    firstName: string;
    lastName: string;
    documentNumber: string;
    born: Date;
    phone: string;
    email: string;
    username: string;
    password: string;
}

export interface IRegisterResult {
    customer: Customer;
}

export const registerCustomer = async (
    data: IRegisterRequest,
    info: GraphQLResolveInfo
) => {
    return new Promise<IRegisterResult>(async (resolve, reject) => {
        try {
            await getManager().transaction(async em => {
                const user = new User();
                user.username = data.username;
                user.roles = Promise.resolve([
                    await Role.getByName(RolesEnum.Customer, em)
                ]);
                user.password = await encryptPassword(data.password);
                const savedUser = await em.save(user);

                const customer = new Customer();
                customer.firstName = StringUtils.toTitleCase(data.firstName);
                customer.lastName = StringUtils.toTitleCase(data.lastName);
                customer.user = Promise.resolve(savedUser);
                customer.documentNumber = data.documentNumber;
                customer.phone = data.phone;
                customer.email = data.email;
                //TODO: Implement email activation
                customer.status = AccountStatusEnum.Active;
                const savedCustomer = await em.save(customer);
                //We need to create the wallets for each fuel type
                const fuelTypes = await FuelType.getAll(em);
                for (let i = 0; i < fuelTypes.length; i++) {
                    const wallet = new Wallet();
                    wallet.customer = Promise.resolve(savedCustomer);
                    wallet.fuelType = Promise.resolve(fuelTypes[i]);
                    wallet.litres = 0;
                    await em.save(wallet);
                }
                const subinfo = getInfoFromSubfield("customer", info);
                const populatedCustomer = <Customer>(
                    await EntityToGraphResolver.find<Customer>(
                        customer.id,
                        Customer,
                        subinfo,
                        em
                    )
                );
                return resolve({
                    customer: populatedCustomer
                });
            });
        } catch (ex) {
            reject(ex);
        }
    });
};
