import { importSchema } from "graphql-import";

export const gqlSchema = importSchema(__dirname + "/../../gql/schema.graphql");
