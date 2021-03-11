import { GasStation } from "./../database/models/business/gas-station.model";

import { Pump } from "./../database/models/business/pump.model";
import moment from "moment";
import { FuelType } from "./../database/models/business/fuel-type.model";
import {
    GraphQLPartialResolveInfo,
    getInfoFromSubfield
} from "./../core/gql/utils";
import { GraphQLResolveInfo } from "graphql";
import { EntityToGraphResolver } from "./../core/entity-resolver";
import { getManager } from "typeorm";
import request from "request";

export interface IResult<T> {
    success: boolean;
    value: T;
}
export interface IPumpOperation {
    id: number;
    stamp: Date;
    litres: number;
    fuelTypeId: number;
    fuelType: FuelType | null;
    fuelPrice: number;
    total: number;
}

export const getLastPumpOperation = async (
    pumpId: number,
    info?: GraphQLResolveInfo | GraphQLPartialResolveInfo
): Promise<Omit<IPumpOperation, "fuelTypeId"> | null> => {
    try {
        const pump = <Pump>await Pump.getById(pumpId);
        // const gasStation = await pump.gasStation;
        // const { pumpExternalId } = <{ pumpExternalId: string }>(
        //     await getManager()
        //         .createQueryBuilder(Pump, "p")
        //         .select("p.externalId", "pumpExternalId")
        //         .where("p.id = :id", { id: pumpId })
        //         .getRawOne()
        // );
        const wsResponse = await callGetPumpLastOperation(pump.externalId);
        console.log("esto es lo que devuelve la llamada wsResponse", wsResponse);
        if (
            !wsResponse ||
            !wsResponse.success ||
            !(wsResponse.value.length > 0)
        ) {
            return <Omit<IPumpOperation, "fuelTypeId">>{
                id: 0,
                stamp: new Date(),
                fuelType: <FuelType>{ id: 0, name: "" },
                fuelPrice: 0,
                total: 0,
                litres: 0
            };
        }
        const operation = wsResponse.value[0];
        const fuelTypeId = await externalCodeToInternalFuelTypeId(
            (<GasStation>await pump.gasStation).id as number,
            operation.product_id.toString()
        );
        if (!fuelTypeId) {
            console.info(
                "No fuel type can be mapped from the external code provided"
            );
            return null;
        }
        const subinfo = getInfoFromSubfield(
            "fuelType",
            <GraphQLResolveInfo>info
        );
        let fuelType: FuelType | null = null;
        if (subinfo) {
            fuelType = await EntityToGraphResolver.find<FuelType>(
                fuelTypeId,
                FuelType,
                subinfo
            );
        } else {
            fuelType = <FuelType>await FuelType.getById(fuelTypeId) ?? null;
        }
        return <Omit<IPumpOperation, "fuelTypeId">>{
            id: operation.transaction_id ?? null,
            stamp: new Date(operation.date),
            fuelType: fuelType,
            fuelPrice: operation.unit_price,
            total: operation.total,
            litres: operation.quantity
        };
    } catch (e) {
        console.log(
            "Error when retreiving last operation for pump with id: ",
            pumpId
        );
        console.log(e);
        return null;
    }
};

export const externalCodeToInternalFuelTypeId = async (
    gasStationId: number,
    externalCode: string
): Promise<number | null> => {
    const em = getManager();
    const { internalCode }: { internalCode: number | null } = await em
        .createQueryBuilder(GasStation, "g")
        .leftJoin("g.fuelTypesMap", "m")
        .leftJoin("m.fuelType", "t")
        .select("t.id", "internalCode")
        .where("g.id = :gasStationId", { gasStationId })
        .andWhere("m.externalCode = :externalCode", { externalCode })
        .getRawOne();
    return internalCode;
};

interface IPumpLastOperationWSResult {
    transaction_id: number;
    date: string;
    pipe_id: number;
    dispatcher_id: number;
    product_id: number;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
}

const LAST_OPERATION_URL = (id: string) => {
    const parameters = id.split("|");

    let url =
        "/api/execute/getrows/getLastSaleById?token=21OMPuyzukkmumNj";
    parameters.map((param, i) => (url = url + `&args[${i}]=${param}`));
    return url;
};

export const callGetPumpLastOperation = (
    pumpExternalId: string
): Promise<IResult<Array<IPumpLastOperationWSResult>>> => {
    return new Promise<IResult<Array<IPumpLastOperationWSResult>>>(
        async (resolve, reject) => {
            const { gasStationWSUrl } = <{ gasStationWSUrl: string }>(
                await getManager()
                    .createQueryBuilder(Pump, "p")
                    .leftJoin("p.gasStation", "g")
                    .select("g.externalWSUrl", "gasStationWSUrl")
                    .where("p.externalId = :id", { id: pumpExternalId })
                    .getRawOne()
            );
            console.log(
                "calling: ",
                `${gasStationWSUrl}${LAST_OPERATION_URL(pumpExternalId)}`
            );
            request(
                `${gasStationWSUrl}${LAST_OPERATION_URL(pumpExternalId)}`,
                {
                    strictSSL: false
                },
                (err, res, body) => {
                    if (err) reject(null);
                    resolve(
                        <IResult<Array<IPumpLastOperationWSResult>>>(
                            JSON.parse(body)
                        )
                    );
                }
            );
        }
    );
};

const CONFIRM_OPERATION = "/api/execute/getrows/insertTransaction";
const TOKEN_API_CALL = "21OMPuyzukkmumNj";
export const confirmRefuelOperation = (
    pumpExternalId: string,
    externalId: number,
    stamp: Date,
    total: number,
    operationId: number,
    documentNumber: string
) => {
    return new Promise<boolean>(async (resolve, reject) => {
        const { gasStationWSUrl } = <{ gasStationWSUrl: string }>await getManager()
            .createQueryBuilder(Pump, "p")
            .leftJoin("p.gasStation", "g")
            .select("g.externalWSUrl", "gasStationWSUrl")
            .where("p.externalId = :id", { id: pumpExternalId })
            .getRawOne();

        request(
            `${gasStationWSUrl}${CONFIRM_OPERATION}`
            + `?token=${TOKEN_API_CALL}`
            + `&args[0]=${externalId}`
            + `&args[1]=${moment(stamp).toJSON()}`
            + `&args[2]=1`
            + `&args[3]=${total}`
            + `&args[4]=${operationId}`
            + `&args[5]=${documentNumber}`,
            {
                strictSSL: false
            },
            (err, res, body) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(true);
                }
            }
        );
    });
}

export interface IIFuelPriceWSResult {
    item_id: number;
    price: number;
}

const FUEL_PRICES_URL =
    "https://changosrl.caldenoil.com:50443/api/execute/getrows/getPrices?token=21OMPuyzukkmumNj";
export const callGetFuelPrices = (): Promise<IResult<
    Array<IIFuelPriceWSResult>
>> => {
    return new Promise<IResult<Array<IIFuelPriceWSResult>>>(
        async (resolve, reject) => {
            request(
                `${FUEL_PRICES_URL}`,
                {
                    strictSSL: false
                },
                (err, res, body) => {
                    if (err) reject(err);
                    resolve(
                        <IResult<Array<IIFuelPriceWSResult>>>JSON.parse(body)
                    );
                }
            );
        }
    );
};
