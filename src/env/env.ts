import { first } from "rxjs/operators";
import { Subject, Observable } from "rxjs";
import { LoggerOptions } from "typeorm/logger/LoggerOptions";
import * as fs from "fs";

export const isProduction = process.env.NODE_ENV === "prod";

export interface IEnvironmentalConfig {
    database: IDatabaseConfig;
    scheduledMaintenanceCheckInterval: number;
    secretToken: string;
}

export interface IDatabaseConfig {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    logging: LoggerOptions;
    synchronize: boolean;
}

export const environmentalConfig = (): Observable<IEnvironmentalConfig> => {
    const changesSubject = new Subject<IEnvironmentalConfig>();
    readConfig()
        .then(config => changesSubject.next(config))
        .catch(console.log);
    fs.watchFile(getConfigFilePath(), { interval: 1000 }, async () => {
        changesSubject.next(await readConfig());
    });
    return changesSubject;
};

export const getCurrentEnvironmentalConfig = (): Promise<IEnvironmentalConfig> =>
    readConfig();

export const readConfig = (): Promise<IEnvironmentalConfig> => {
    return new Promise((resolve, reject) => {
        fs.readFile(getConfigFilePath(), "utf8", (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(JSON.parse(data));
        });
    });
};

export const getConfigFilePath = () => {
    const sufix = isProduction ? "" : ".development";
    return `${__dirname}/../../config${sufix}.json`;
};
