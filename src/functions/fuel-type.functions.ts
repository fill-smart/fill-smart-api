import { getManager } from "typeorm";
import { FuelType } from "../database/models/business/fuel-type.model";
import { GraphQLResolveInfo } from "graphql";
import { FuelPrice } from "../database/models/business/fuel-price.model";
import { EntityToGraphResolver } from "../core/entity-resolver";
import {
    GraphQLPartialResolveInfo,
    getInfoFromSubfield
} from "../core/gql/utils";
import { SendFcmToCustomer, SendFcmToAll } from "../firebase/firebase";
import { Notifications } from "../firebase/fcm-notifications";

export interface IFuelTypePatchInput extends FuelType { }

export const FuelTypeFunctions = {
    edit: async (
        { id, ...data }: IFuelTypePatchInput,
        info: GraphQLResolveInfo
    ) => {
        await FuelType.update(id as number, data);
        await SendFcmToAll(
            Notifications.FuelTypeNameChanged()
        );
        return EntityToGraphResolver.find<FuelType>(id as number, FuelType, info);
    },
    currentPrice: async (
        fuelTypeId: number,
        info?: GraphQLResolveInfo
    ): Promise<FuelPrice> => {
        try {
            const em = getManager();
            if (fuelTypeId != 0) {
                const { priceId } = <{ priceId: number }>await em
                    .createQueryBuilder(FuelPrice, "p")
                    .select("p.id", "priceId")
                    .leftJoin("p.fuelType", "t")
                    .where("t.id = :fuelTypeId AND p.to is null", { fuelTypeId })
                    .getRawOne();

                if (info) {
                    return <FuelPrice>(
                        await EntityToGraphResolver.find<FuelPrice>(
                            priceId,
                            FuelPrice,
                            info,
                            em
                        )
                    );
                } else {
                    return <FuelPrice>await FuelPrice.getById(priceId);
                }
            }
            return Promise.resolve(<FuelPrice>{ id: 0, price: 0 });
        } catch (e) {
            throw e;
        }
    },

    previousPrice: async (
        fuelTypeId: number,
        info: GraphQLResolveInfo
    ): Promise<FuelPrice> => {
        try {
            const em = getManager();
            const { priceId }: { priceId: number } = await em
                .createQueryBuilder(FuelPrice, "p")
                .select("p.id", "priceId")
                .leftJoin("p.fuelType", "t")
                .where("t.id = :fuelTypeId AND p.to is not null", {
                    fuelTypeId
                })
                .orderBy("p.from", "DESC")
                .limit(1)
                .getRawOne();

            return <FuelPrice>(
                await EntityToGraphResolver.find<FuelPrice>(
                    priceId,
                    FuelPrice,
                    info,
                    em
                )
            );
        } catch (e) {
            throw e;
        }
    }
};
