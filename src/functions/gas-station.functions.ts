import { Geocode, Distance } from "./../core/googlemaps/geocoder";
import { getCurrentEnvironmentalConfig } from "./../core/env/env";
import { EntityToGraphResolver } from "./../core/entity-resolver";
import { GasStation } from "./../database/models/business/gas-station.model";
import { Pump } from "../database/models/business/pump.model";
import { getManager } from "typeorm";
import { GraphQLResolveInfo } from "graphql";
import googlemaps from "@google/maps";

type PartialGasStation = Pick<GasStation, "id"> & Partial<GasStation>;

export interface IGasStationPatchInput extends PartialGasStation { }

export interface IGasStationCreateInput
    extends Omit<
    GasStation,
    "id" | "created" | "updated" | "deleted" | "lat" | "lng"
    > { }

export const GasStationFunctions = {
    create: async (
        { ...data }: IGasStationCreateInput,
        info: GraphQLResolveInfo
    ) => {
        try {
            console.log("gasStation: ", JSON.stringify(data));
            const { lat, lng } = await Geocode(data.address);
            const gasStation = Object.assign(new GasStation(), <
                Partial<GasStation>
                >{
                    ...data,
                    lat,
                    lng
                });
            const { id } = await GasStation.create(gasStation);
            return await EntityToGraphResolver.find<GasStation>(
                id as number,
                GasStation,
                info
            );
        } catch (e) {
            console.log(e);
        }
    },
    edit: async (
        { id, ...data }: IGasStationPatchInput,
        info: GraphQLResolveInfo
    ) => {
        const gasStation = <GasStation>await GasStation.getById(id as number);
        if (data.address && data.address !== gasStation.address) {
            const { lat, lng } = await Geocode(data.address);
            data["lat"] = lat;
            data["lng"] = lng;
        }

        await GasStation.update(id as number, data);
        return await EntityToGraphResolver.find<GasStation>(
            id as number,
            GasStation,
            info
        );
    },
    countPumps: async (gasStationId: number): Promise<number> => {
        try {
            const em = getManager();
            const count = em
                .createQueryBuilder(Pump, "p")
                .select("p.id")
                .leftJoin("p.gasStation", "g")
                .where("g.id = :id", { id: gasStationId })
                .getCount();

            return count;
        } catch (e) {
            throw e;
        }
    },
    isGasStationsInRadiusFilter: async (lat: number, lng: number, distanceRadioKm: number): Promise<boolean> => {
        try {
            const em = getManager();
            const gasStations: GasStation[] = await em
                .createQueryBuilder(GasStation, "g")
                .getMany();

            return gasStations.some(gasstation => {
                let distance = Distance(lat, lng, gasstation.lat, gasstation.lng, 'KM')
                return distance <= distanceRadioKm;
            });
        } catch (e) {
            console.log(e);
            return false;
        }
    }


};
