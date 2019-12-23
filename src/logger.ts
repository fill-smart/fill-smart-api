import { Logger, QueryRunner } from "typeorm";
import { highlight } from "cli-highlight";
import { SocketIo, ChannelsEnum } from "./io/sender";

export const sendLogMessageToClient = (...messages: any[]) => {
    SocketIo.send(ChannelsEnum.Sql, messages);
};

export class SocketLogger implements Logger {
    logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
        if (process.env.NODE_ENV !== "prod") {
            console.log(highlight(query), parameters);
        }
        sendLogMessageToClient(query, parameters);
    }

    logQueryError(
        error: string,
        query: string,
        parameters?: any[],
        queryRunner?: QueryRunner
    ) {
        sendLogMessageToClient(error, query, parameters);
    }

    logQuerySlow(
        time: number,
        query: string,
        parameters?: any[],
        queryRunner?: QueryRunner
    ) {
        sendLogMessageToClient(time, query, parameters);
    }

    logSchemaBuild(message: string, queryRunner?: QueryRunner) {
        sendLogMessageToClient(message);
    }

    logMigration(message: string, queryRunner?: QueryRunner) {
        sendLogMessageToClient(message);
    }

    log(
        level: "log" | "info" | "warn",
        message: any,
        queryRunner?: QueryRunner
    ) {
        sendLogMessageToClient(message);
    }
}
