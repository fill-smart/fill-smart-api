import { User } from "./../database/models/business/user.model";

import { gql } from "apollo-server-express";

export const gqlSchema = gql`
    scalar DateTime
    scalar Date

    enum UserRoles {
        ADMIN
        CUSTOMER
    }

    "Restricts what an User can do"
    type Role {
        id: ID!
        created: DateTime!
        updated: DateTime
        deleted: Boolean!
        name: UserRoles!
    }

    type RoleResult {
        pageInfo: PageInfo!
        result: [Role!]!
    }

    "Entities that interact with the system"
    type User {
        id: ID!
        created: DateTime!
        updated: DateTime
        deleted: Boolean!
        username: String!
        roles: [Role!]!
        documents: [Document!]!
        customer: Customer
    }

    type UserResult {
        pageInfo: PageInfo!
        result: [User!]!
    }

    "Classsification of documents"
    type DocumentType {
        id: ID!
        created: DateTime!
        updated: DateTime
        deleted: Boolean!
        name: String!
    }

    type DocumentTypeResult {
        pageInfo: PageInfo!
        result: [DocumentType!]!
    }

    "Classsification of fuels"
    type FuelType {
        id: ID!
        created: DateTime!
        updated: DateTime
        deleted: Boolean!
        name: String!
    }

    type FuelTypeResult {
        pageInfo: PageInfo!
        result: [FuelType!]!
    }

    "Price of a certain type of fuel on a given date"
    type FuelPrice {
        id: ID!
        created: DateTime!
        updated: DateTime
        deleted: Boolean!
        from: DateTime!
        to: DateTime
        price: Float!
        fuelType: FuelType!
    }

    type FuelPriceResult {
        pageInfo: PageInfo!
        result: [FuelPrice!]!
    }

    "Price of a certain type of fuel on a given date"
    type GasStation {
        id: ID!
        created: DateTime!
        updated: DateTime
        deleted: Boolean!
        name: String!
        lat: Float!
        lng: Float!
        address: String!
        operations: [Operation!]!
    }

    type GasStationResult {
        pageInfo: PageInfo!
        result: [GasStation!]!
    }

    "Images uploaded to the system"
    type Image {
        id: ID!
        created: DateTime!
        updated: DateTime
        deleted: Boolean!
    }

    type ImageResult {
        pageInfo: PageInfo!
        result: [Image!]!
    }

    "Documentation uploaded to the system by users"
    type Document {
        id: ID!
        created: DateTime!
        updated: DateTime
        deleted: Boolean!
        documentData: String
        image: Image
        documentType: DocumentType!
    }

    type DocumentResult {
        pageInfo: PageInfo!
        result: [Document!]!
    }

    """
    ACTIVE: The account is ready to perform operations
    INACTIVE: The account needs some aditional validation in order to be active
    """
    enum AccountStatus {
        ACTIVE
        INACTIVE
    }

    "People that perform operations on the Mobile App"
    type Customer {
        id: ID!
        created: DateTime!
        updated: DateTime
        deleted: Boolean!
        firstName: String!
        lastName: String!
        documentNumber: String!
        born: Date!
        phone: String!
        email: String!
        status: AccountStatus!
        user: User!
        documents: [Document!]!
        wallets: [Wallet!]!
    }

    type CustomerResult {
        pageInfo: PageInfo!
        result: [Customer!]!
    }

    "Contains the litres of a certain fuel type that a customer holds"
    type Wallet {
        id: ID!
        created: DateTime!
        updated: DateTime
        deleted: Boolean!
        fuelType: FuelType!
        litres: Float!
        customer: Customer!
        operations: [Operation!]!
    }

    type WalletResult {
        pageInfo: PageInfo!
        result: [Wallet!]!
    }

    "Classification of operations"
    type OperationType {
        id: ID!
        created: DateTime!
        updated: DateTime
        deleted: Boolean!
        name: String!
    }

    type OperationTypeResult {
        pageInfo: PageInfo!
        result: [OperationType!]!
    }

    """
    COMPLETED: The operation is complete and the fuel has been either substracted or added.
    PENDING: The operation is awaiting for a third party confirmation.
    """
    enum OperationStatus {
        COMPLETED
        PENDING
    }

    """
    CASH: The customer pays in cash directly on the gas station.
    MERCADOPAGO: The customer will use Mercadopago make the payment.
    """
    enum PaymentMethods {
        CASH
        MERCADOPAGO
    }

    "Contains the litres of a certain fuel type that a customer holds"
    type Operation {
        id: ID!
        created: DateTime!
        updated: DateTime
        deleted: Boolean!
        fuelType: FuelType!
        fuelPrice: FuelPrice!
        litres: Float!
        wallet: Wallet!
        stamp: DateTime!
        status: OperationStatus!
        paymentMethod: PaymentMethods!
        operationType: OperationType!
        gasStation: GasStation!
    }

    type OperationResult {
        pageInfo: PageInfo!
        result: [Operation!]!
    }

    type APIInfo {
        version: String!
        hash: String!
    }

    "Contains information related to pagination"
    type PageInfo {
        total: Int!
    }

    input QueryCriteria {
        max: Int
        skip: Int
        filter: String
        Sort: String
    }

    ##Queries
    type Query {
        customers(criteria: QueryCriteria): CustomerResult!
        customerById(id: ID!): Customer
        documentTypes(criteria: QueryCriteria): DocumentTypeResult!
        documentTypeById(id: ID!): DocumentType
        documents(criteria: QueryCriteria): DocumentResult!
        documentById(id: ID!): Document
        fuelPrices(criteria: QueryCriteria): FuelPriceResult!
        fuelPriceById(id: ID!): FuelPrice
        fuelTypes(criteria: QueryCriteria): FuelTypeResult!
        fuelTypeById(id: ID!): FuelType
        gasStations(criteria: QueryCriteria): GasStationResult!
        gasStationById(id: ID!): GasStation
        images(criteria: QueryCriteria): ImageResult!
        imageById(id: ID!): Image
        operationTypes(criteria: QueryCriteria): OperationTypeResult!
        operationTypeById(id: ID!): OperationType
        operations(criteria: QueryCriteria): OperationResult!
        operationById(id: ID!): Operation
        roles(criteria: QueryCriteria): RoleResult!
        roleById(id: ID!): Role
        users(criteria: QueryCriteria): UserResult!
        userById(id: ID!): User
        wallets(criteria: QueryCriteria): WalletResult!
        walletById(id: ID!): Wallet

        """
        Gives realtime information about the API.

        Allowed Roles: [**ADMIN**]
        """
        apiInfo: APIInfo!
    }

    input LoginInput {
        username: String!
        password: String!
    }

    "Contains the authenticated user and a token bearer for secure requests"
    type LoginResult {
        token: String!
        user: User!
    }

    input RegisterInput {
        firstName: String!
        lastName: String!
        documentNumber: String!
        born: Date!
        phone: String!
        email: String!
        username: String!
        password: String!
    }

    "Contains the registered customer"
    type RegisterResult {
        customer: Customer!
    }

    input AddFuelInput {
        fuelTypeId: ID!
        gasStationId: ID!
        pumpId: String!
        litres: Float!
        paymentMethod: PaymentMethods! 
    }

    "Contains result of the operation"
    type AddFuelResult {        
        operation: Operation!
    }

    input PayShopPurchaselInput {
        shopId: ID!
    }

    "Contains result of the operation"
    type PayShopPurchaseResult {
        ok: Boolean!
        receiptId: String!
    }

    input ExchangeFuellInput {
        fromFuelTypeId: ID!
        toFuelTypeId: ID!
        litres: Float!
    }

    "Contains result of the operation"
    type ExchangeFuelResult {
        ok: Boolean!
        receiptId: String!
    }

    input ConsumeFuelInput {
        fuelTypeId: ID!
        litres: Float!
    }

    "Contains result of the operation"
    type ConsumeFuelResult {
        ok: Boolean!
        receiptId: String!
    }

    input TakeOutCashInput {
        fuelTypeId: ID!
        litres: Float!
    }

    "Contains result of the operation"
    type TakeOutCashResult {
        ok: Boolean!
        receiptId: String!
    }

    type Mutation {
        """
        Allows users to authenticate for secure requests
        """
        login(credentials: LoginInput): LoginResult
        """
        Requests the creation of a new customer
        """
        register(data: RegisterInput): RegisterResult
        """
        Adds fuel to a customer's wallet
        """
        addFuelToWallet(data: AddFuelInput): AddFuelResult
        """
        Allows customers to pay for their shop purchases with fuel from their wallets
        """
        payShopPurchase(data: PayShopPurchaselInput): PayShopPurchaseResult
        """
        Allows customers to exchange fuel from one type to another
        """
        exchangeFuel(data: ExchangeFuellInput): ExchangeFuelResult
        """
        Allows customers to consume their purchased fuel and load it into their vehicles from a gas station
        """
        consumeFuel(data: ConsumeFuelInput): ConsumeFuelResult
        """
        Allows customers to exchange their available fuel for money
        """
        takeOutCash(data: TakeOutCashInput): TakeOutCashResult
    }
`;
