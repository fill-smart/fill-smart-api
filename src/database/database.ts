import { SnakeNamingStrategy } from "./snake-naming-strategy";
import { SocketLogger } from "./../logger";
import { createConnection, Connection } from "typeorm";
import { environmentalConfig } from "../env/env";
import { first, filter, map } from "rxjs/operators";

export const initializeDatabase = async () => {
    return new Promise((resolve, reject) => {
        try {
            let connection: Connection;
            environmentalConfig()
                .pipe(
                    first(),
                    filter(c => !!c.database),
                    map(c => c.database)
                )
                .subscribe(
                    async databaseConfig => {
                        try {
                            if (connection) {
                                connection.close();
                            }
                            connection = await createConnection({
                                type: "mysql",
                                host: databaseConfig.host,
                                port: databaseConfig.port,
                                username: databaseConfig.user,
                                password: databaseConfig.password,
                                database: databaseConfig.name,
                                entities: [`${__dirname}/models/business/*.js`,`${__dirname}/models/system/*.js`],
                                logging: databaseConfig.logging,
                                logger: new SocketLogger(),
                                namingStrategy: new SnakeNamingStrategy(),
                                synchronize: databaseConfig.synchronize
                            });
                            resolve();
                        } catch (e) {
                            console.log(e);
                            reject(e);
                        }
                    },
                    err => {
                        console.log(err);
                        reject(err);
                    }
                );
        } catch (e) {
            reject(e);
        }
    });
};
