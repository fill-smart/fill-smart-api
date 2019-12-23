import {
    OperationType,
    OperationTypesEnum
} from "./../database/models/business/operation-type.model";
import {
    Operation,
    PaymentMethodsEnum,
    OperationStatusEnum
} from "./../database/models/business/operation.model";
import { Wallet } from "./../database/models/business/wallet.model";
import { getManager } from "typeorm";
import { EntityToGraphResolver } from "../database/query-resolver";
import { GraphQLResolveInfo } from "graphql";
import { getInfoFromSubfield } from "../gql/utils";
import { Customer } from "../database/models/business/customer.model";
import { IDecodedToken } from "./security";
import { FuelType } from "../database/models/business/fuel-type.model";
import { FuelPrice } from "../database/models/business/fuel-price.model";
import { GasStation } from "../database/models/business/gas-station.model";

export interface IAddFuelRequest {
    fuelTypeId: number;
    gasStationId: number;
    pumpId: string;
    litres: number;
    paymentMethod: PaymentMethodsEnum;
}

export interface IAddFuelResult {
    operation: Operation;
}

export const addFuelToWallet = async (
    data: IAddFuelRequest,
    info: GraphQLResolveInfo,
    { user }: { user: IDecodedToken }
) => {
    return new Promise<IAddFuelResult>(async (resolve, reject) => {
        try {
            await getManager().transaction(async em => {
                console.log("userid: ",user);
                const customer = await Customer.getByUser(user.id, em);
                if (!customer) {
                    throw "User has no customer";
                }
                const wallet = await Wallet.getByCustomerAndFuelType(
                    customer.id,
                    data.fuelTypeId
                );
                const fuelType = <FuelType>(
                    await FuelType.getById(data.fuelTypeId, em)
                );
                if (!wallet) {
                    throw "Customer has no wallet for the given fuel type";
                }

                const operation = new Operation();
                operation.wallet = Promise.resolve(<Wallet>wallet);
                operation.litres = data.litres;
                operation.stamp = new Date();
                operation.fuelType = Promise.resolve(fuelType);
                const fuelPrice = await FuelPrice.getCurrentByFuelType(
                    fuelType.id,
                    em
                );
                if (!FuelPrice) {
                    throw "The Fuel Type has no price available";
                }
                operation.fuelPrice = Promise.resolve(<FuelPrice>fuelPrice);
                const gasStation = await GasStation.getById(
                    data.gasStationId,
                    em
                );
                if (!gasStation) {
                    throw "No gas station exists for that id";
                }
                operation.gasStation = Promise.resolve(<GasStation>gasStation);
                const operationType = await OperationType.getByName(
                    OperationTypesEnum.Recarga,
                    em
                );
                if (!operationType) {
                    throw "No operation type found for the operation";
                }
                operation.operationType = Promise.resolve(operationType);
                operation.paymentMethod = data.paymentMethod;
                operation.status = OperationStatusEnum.Completed;
                operation.externalId = "-";
                const savedOperation = await em.save(operation);
                wallet.litres += data.litres;
                await em.save(wallet);
                const subinfo = getInfoFromSubfield("operation", info);
                const populatedOperation = <Operation>(
                    await EntityToGraphResolver.find<Operation>(
                        savedOperation.id,
                        Operation,
                        subinfo,
                        em
                    )
                );
                return resolve({
                    operation: populatedOperation
                });
            });
        } catch (ex) {
            reject(ex);
        }
    });
};
