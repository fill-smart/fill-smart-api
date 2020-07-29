import { GasStation } from "./../database/models/business/gas-station.model";
import { EntityToGraphResolver } from "./../core/entity-resolver";
import { Pump } from "../database/models/business/pump.model";
import { GraphQLResolveInfo } from "graphql";

interface IRelatedGasStation {
    gasStationId: number;
}

type PartialPump = Pick<Pump, "id"> & Partial<Pump> & IRelatedGasStation;

export interface IPumpPatchInput extends PartialPump {}

export type IPumpCreateInput = Omit<
    Pump,
    "id" | "created" | "updated" | "deleted" | "lat" | "lng"
> &
    IRelatedGasStation;

export const PumpFunctions = {
    create: async (
        { gasStationId, ...data }: IPumpCreateInput,
        info: GraphQLResolveInfo
    ) => {
        try {
            console.log("pump: ", JSON.stringify(data));
            const pump = Object.assign(new Pump(), data);
            const gasStation = <Promise<GasStation> | undefined>(
                GasStation.getById(gasStationId)
            );
            pump.gasStation = gasStation;
            const { id } = await Pump.create(pump);
            return await EntityToGraphResolver.find<Pump>(id as number, Pump, info);
        } catch (e) {
            console.log(e);
        }
    },
    edit: async (
        { id, gasStationId, ...data }: IPumpPatchInput,
        info: GraphQLResolveInfo
    ) => {
        const pump = <Pump>await Pump.getById(id as number);
        const gasStation = <Promise<GasStation> | undefined>(
            GasStation.getById(gasStationId)
        );
        pump.gasStation = gasStation;
        await Pump.update(id as number, data);
        return await EntityToGraphResolver.find<Pump>(id as number, Pump, info);
    }
};
