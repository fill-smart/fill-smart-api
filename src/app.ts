import { Operation } from "./database/views/business/operation.view";
import { getManager } from "typeorm";
import { getCurrentEnvironmentalConfig } from "./core/env/env";
import fs from "fs";
import "reflect-metadata";
import { scheduleCronJobs } from "./core/crons/cron-list";
import { MercadoPago } from "./functions/mercado-pago.functions";
import { scalarResolvers, gqlResolvers } from "./gql/resolvers";
import { initializeDatabase } from "./core/database/database";
import { ApolloServer } from "apollo-server-express";
import http from "http";
import express, { Request } from "express";
import { gqlSchema } from "./core/gql/schema";
import {
  initializeMaintenanceChecker,
  maintenanceMiddleware,
} from "./core/scheduler/maintenances-scheduler";
import { decodeToken } from "./functions/security.functions";
import { ipnHandler } from "./express/ipn-handler.routes";
import cors from "cors";
import { json } from "express";
import path from "path";
import Mailer from "./core/mailing/mailer";
import Jimp from "jimp";

const startServer = async () => {
  const app = express();
  app.use(json({ limit: "50mb" }));
  app.use(maintenanceMiddleware);
  app.use(cors());
  app.use(express.static(path.join(__dirname, "wwwroot")));
  const httpServer = new http.Server(app);
  const config = await getCurrentEnvironmentalConfig();

  const server = new ApolloServer({
    introspection: config.enablePlayground,
    playground: config.enablePlayground,
    typeDefs: gqlSchema,
    resolvers: { ...scalarResolvers, ...gqlResolvers },
    context: async ({ req, connection }: { req: Request; connection: any }) => {
      if (connection) {
        // check connection for metadata
        return connection.context;
      } else {
        const token = req.headers.authorization;
        if (token) {
          const user = await decodeToken(token.replace("Bearer ", ""));
          return { user };
        }
      }
    },
  });

  server.applyMiddleware({ app });
  server.installSubscriptionHandlers(httpServer);

  // This `listen` method launches a web-server.  Existing apps
  // can utilize middleware options, which we'll discuss later.
  httpServer.listen({ port: process.env.PORT || 4000 }, () => {
    console.log(
      `🚀 Server ready at http://localhost:${process.env.PORT || 4000}${
        server.graphqlPath
      }`
    );
    console.log(
      `🚀 Subscriptions ready at ws://localhost:${process.env.PORT || 4000}${
        server.subscriptionsPath
      }`
    );
  });
  app.use(ipnHandler);
};

startServer()
  .then(async () => {
    try {
      await initializeDatabase();
      initializeMaintenanceChecker();
      scheduleCronJobs();
      await MercadoPago.Initialize();
      /*const operations = await getManager().createQueryBuilder(Operation,"o").getCount();
      console.log("operations: ", operations);*/
    } catch (e) {
      throw e;
    }
  })
  .catch(console.log);
process.on("warning", (e) => console.warn(e.stack));
