import { IAddFuelRequest, addFuelToWallet } from "./../functions/customer";
import {
    ILoginResult,
    ILoginRequest,
    login,
    IDecodedToken
} from "./../functions/security";
import { GasStation } from "./../database/models/business/gas-station.model";
import { Wallet } from "./../database/models/business/wallet.model";
import { User } from "./../database/models/business/user.model";
import { OperationType } from "./../database/models/business/operation-type.model";
import { Image } from "./../database/models/business/image.model";
import { FuelType } from "./../database/models/business/fuel-type.model";
import { FuelPrice } from "./../database/models/business/fuel-price.model";
import { Document } from "./../database/models/business/document.model";
import { DocumentType } from "./../database/models/business/document-type.model";
import {
    OperationStatusEnum,
    PaymentMethodsEnum,
    Operation
} from "./../database/models/business/operation.model";
import {
    AccountStatusEnum,
    Customer
} from "./../database/models/business/customer.model";
import { Role, RolesEnum } from "./../database/models/business/role.model";
import { getAPIInfo } from "../info/info";
import { GraphQLResolveInfo } from "graphql";
import {
    EntityToGraphResolver,
    IQueryCriteria
} from "../database/query-resolver";
import { GraphQLDateTime, GraphQLDate } from "graphql-iso-date";
import { IRegisterRequest, registerCustomer } from "../functions/registration";

export const gqlResolvers = {
    Query: {
        roles: (
            obj: any,
            { criteria }: { criteria: IQueryCriteria },
            context: any,
            info: GraphQLResolveInfo
        ) => EntityToGraphResolver.list<Role>(Role, info, criteria),
        roleById: (
            obj: any,
            { id }: { id: number },
            context: any,
            info: GraphQLResolveInfo
        ) => EntityToGraphResolver.find<Role>(id, Role, info),
        customers: (
            obj: any,
            { criteria }: { criteria: IQueryCriteria },
            context: any,
            info: GraphQLResolveInfo
        ) => EntityToGraphResolver.list<Customer>(Customer, info, criteria),
        customerById: (
            obj: any,
            { id }: { id: number },
            context: any,
            info: GraphQLResolveInfo
        ) => EntityToGraphResolver.find<Customer>(id, Customer, info),
        documentTypes: (
            obj: any,
            { criteria }: { criteria: IQueryCriteria },
            context: any,
            info: GraphQLResolveInfo
        ) =>
            EntityToGraphResolver.list<DocumentType>(
                DocumentType,
                info,
                criteria
            ),
        documentTypeById: (
            obj: any,
            { id }: { id: number },
            context: any,
            info: GraphQLResolveInfo
        ) => EntityToGraphResolver.find<DocumentType>(id, DocumentType, info),
        documents: (
            obj: any,
            { criteria }: { criteria: IQueryCriteria },
            context: any,
            info: GraphQLResolveInfo
        ) => EntityToGraphResolver.list<Document>(Document, info, criteria),
        documentById: (
            obj: any,
            { id }: { id: number },
            context: any,
            info: GraphQLResolveInfo
        ) => EntityToGraphResolver.find<Document>(id, Document, info),
        images: (
            obj: any,
            { criteria }: { criteria: IQueryCriteria },
            context: any,
            info: GraphQLResolveInfo
        ) => EntityToGraphResolver.list<Image>(Image, info, criteria),
        imageById: (
            obj: any,
            { id }: { id: number },
            context: any,
            info: GraphQLResolveInfo
        ) => EntityToGraphResolver.find<Document>(id, Document, info),
        gasStations: (
            obj: any,
            { criteria }: { criteria: IQueryCriteria },
            context: any,
            info: GraphQLResolveInfo
        ) => EntityToGraphResolver.list<GasStation>(GasStation, info, criteria),
        gasStationById: (
            obj: any,
            { id }: { id: number },
            context: any,
            info: GraphQLResolveInfo
        ) => EntityToGraphResolver.find<GasStation>(id, GasStation, info),
        fuelPrices: (
            obj: any,
            { criteria }: { criteria: IQueryCriteria },
            context: any,
            info: GraphQLResolveInfo
        ) => EntityToGraphResolver.list<FuelPrice>(FuelPrice, info, criteria),
        fuelPriceById: (
            obj: any,
            { id }: { id: number },
            context: any,
            info: GraphQLResolveInfo
        ) => EntityToGraphResolver.find<FuelPrice>(id, FuelPrice, info),
        fuelTypes: (
            obj: any,
            { criteria }: { criteria: IQueryCriteria },
            context: any,
            info: GraphQLResolveInfo
        ) => EntityToGraphResolver.list<FuelType>(FuelType, info, criteria),
        fuelTypeById: (
            obj: any,
            { id }: { id: number },
            context: any,
            info: GraphQLResolveInfo
        ) => EntityToGraphResolver.find<FuelType>(id, FuelType, info),
        operationTypes: (
            obj: any,
            { criteria }: { criteria: IQueryCriteria },
            context: any,
            info: GraphQLResolveInfo
        ) =>
            EntityToGraphResolver.list<OperationType>(
                OperationType,
                info,
                criteria
            ),
        operationTypeById: (
            obj: any,
            { id }: { id: number },
            context: any,
            info: GraphQLResolveInfo
        ) => EntityToGraphResolver.find<OperationType>(id, OperationType, info),
        operations: (
            obj: any,
            { criteria }: { criteria: IQueryCriteria },
            context: any,
            info: GraphQLResolveInfo
        ) => EntityToGraphResolver.list<Operation>(Operation, info, criteria),
        operationById: (
            obj: any,
            { id }: { id: number },
            context: any,
            info: GraphQLResolveInfo
        ) => EntityToGraphResolver.find<Operation>(id, Operation, info),
        users: (
            obj: any,
            { criteria }: { criteria: IQueryCriteria },
            context: any,
            info: GraphQLResolveInfo
        ) => EntityToGraphResolver.list<User>(User, info, criteria),
        userById: (
            obj: any,
            { id }: { id: number },
            context: any,
            info: GraphQLResolveInfo
        ) => EntityToGraphResolver.find<User>(id, User, info),
        wallets: (
            obj: any,
            { criteria }: { criteria: IQueryCriteria },
            context: any,
            info: GraphQLResolveInfo
        ) => EntityToGraphResolver.list<Wallet>(Wallet, info, criteria),
        walletById: (
            obj: any,
            { id }: { id: number },
            context: any,
            info: GraphQLResolveInfo
        ) => EntityToGraphResolver.find<Wallet>(id, Wallet, info),

        apiInfo: async (_: any, __: any, context: { user: IDecodedToken }) => {
            mustBeAuthenticated(context);
            mustHaveRole(context, RolesEnum.Administrator);
            return getAPIInfo();
        }
    },
    Mutation: {
        login: async (
            obj: any,
            { credentials }: { credentials: ILoginRequest },
            context: any,
            info: GraphQLResolveInfo
        ) => login(credentials, info),
        register: async (
            obj: any,
            { data }: { data: IRegisterRequest },
            context: any,
            info: any
        ) => registerCustomer(data, info),
        addFuelToWallet: async (
            obj: any,
            { data }: { data: IAddFuelRequest },
            context: { user: IDecodedToken },
            info: any
        ) => {
            mustBeAuthenticated(context);
            mustHaveRole(context, RolesEnum.Customer);
            return addFuelToWallet(data, info, context);
        }
    }
};

export const scalarResolvers = {
    //JSON: GraphQLJSON
    DateTime: GraphQLDateTime,
    Date: GraphQLDate,
    AccountStatus: {
        ACTIVE: AccountStatusEnum.Active,
        INACTIVE: AccountStatusEnum.Inactive
    },
    OperationStatus: {
        COMPLETED: OperationStatusEnum.Completed,
        PENDING: OperationStatusEnum.Pending
    },
    PaymentMethods: {
        CASH: PaymentMethodsEnum.Cash,
        MERCADOPAGO: PaymentMethodsEnum.Mercadopago
    },
    UserRoles: {
        CUSTOMER: RolesEnum.Customer,
        ADMIN: RolesEnum.Administrator
    }
};

export const mustBeAuthenticated = (context: { user: IDecodedToken }) => {
    if (!context.user) {
        throw "Must provide credentials";
    }
};

export const mustHaveRole = async (
    context: { user: IDecodedToken },
    role: RolesEnum
) => {
    if (!context.user.roles.includes(role)) {
        throw "Must provide credentials";
    }
};
