import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import { initializeDatabase } from "./database/database";
import http from "http";
import express, { Request } from "express";
import io from "socket.io";
import { setServerSocket } from "./io/sender";
import { gqlSchema } from "./gql/schema";
import { gqlResolvers, scalarResolvers } from "./gql/resolvers";
import {
    initializeMaintenanceChecker,
    maintenanceMiddleware
} from "./scheduler/maintenances-scheduler";
import { loadFixturesData } from "./fixtures/fixtures";
import { decodeToken } from "./functions/security";

const startServer = async () => {
    const app = express();
    const httpServer = new http.Server(app);
    const socketIo = io(httpServer);
    // Resolvers define the technique for fetching the types in the
    // schema.  We'll retrieve books from the "books" array above.

    /* ScheduledMaintenances middleware */

    app.use(maintenanceMiddleware);

    const server = new ApolloServer({
        introspection: true,
        playground: true,
        typeDefs: gqlSchema,
        resolvers: { ...scalarResolvers, ...gqlResolvers },
        context: async ({ req }: { req: Request }) => {
            const token = req.headers.authorization;
            if (token) {
                const user = await decodeToken(token.replace("Bearer ", ""));
                return { user };
            }
        }
    });

    server.applyMiddleware({ app });

    // This `listen` method launches a web-server.  Existing apps
    // can utilize middleware options, which we'll discuss later.
    httpServer.listen({ port: process.env.PORT || 4000 }, () => {
        console.log(
            `🚢 Server Shipped at http://localhost:${process.env.PORT || 4000}${
                server.graphqlPath
            }`
        );
    });
    setServerSocket(socketIo);
};

startServer()
    .then(async () => {
        try {
            await initializeDatabase();
            initializeMaintenanceChecker();
            //await loadFixturesData();
        } catch (e) {
            throw e;
        }
    })
    .catch(console.log);
process.on("warning", e => console.warn(e.stack));
