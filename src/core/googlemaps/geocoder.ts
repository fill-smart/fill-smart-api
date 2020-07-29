import * as googlemaps from "@google/maps";
import { getCurrentEnvironmentalConfig } from "../env/env";
export const Geocode = (address: string) => {
    return new Promise<googlemaps.LatLngLiteral>(async (resolve, reject) => {
        try {
            const { googleMapsApiKey } = await getCurrentEnvironmentalConfig();
            const { geocode } = googlemaps.createClient({
                key: googleMapsApiKey,
                Promise: Promise
            });

            const result = await geocode({
                address: `${address}, Salta, Salta, Argentina`
            }).asPromise();
            return resolve({
                lat: result.json.results[0].geometry.location.lat,
                lng: result.json.results[0].geometry.location.lng
            });
        } catch (e) {
            console.log("Error: ", e);
            resolve({
                lat: 0,
                lng: 0
            });
        }
    });
};

//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//:::                                                                         :::
//:::  This routine calculates the distance between two points (given the     :::
//:::  latitude/longitude of those points). It is being used to calculate     :::
//:::  the distance between two locations using GeoDataSource (TM) prodducts  :::
//:::                                                                         :::
//:::  Definitions:                                                           :::
//:::    South latitudes are negative, east longitudes are positive           :::
//:::                                                                         :::
//:::  Passed to function:                                                    :::
//:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
//:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
//:::    unit = the unit you desire for results                               :::
//:::           where: 'MILES' is statute miles (default)                         :::
//:::                  'KM' is kilometers                                      :::
//:::                  'NAUTIC_MILES' is nautical miles                                  :::
//:::                                                                         :::
//:::  Worldwide cities and other features databases with latitude longitude  :::
//:::  are available at https://www.geodatasource.com                         :::
//:::                                                                         :::
//:::  For enquiries, please contact sales@geodatasource.com                  :::
//:::                                                                         :::
//:::  Official Web site: https://www.geodatasource.com                       :::
//:::                                                                         :::
//:::               GeoDataSource.com (C) All Rights Reserved 2018            :::
//:::                                                                         :::
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
export const Distance = (lat1: number, lon1: number, lat2: number, lon2: number, unit: 'KM' | 'MILES' | 'NAUTIC_MILES'): number => {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1 / 180;
        var radlat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit == "KM") { dist = dist * 1.609344 }
        if (unit == "NAUTIC_MILES") { dist = dist * 0.8684 }
        return dist;
    }
}