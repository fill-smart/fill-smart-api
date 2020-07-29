import { OperationTotalsByFuelType } from './../database/views/business/operations-totals-by-fuel-type.view';
import { Operation } from './../database/views/business/operation.view';
import {
  CashDepositFunctions,
  ICashDepositCreateInput,
} from "./../functions/cash-deposit.functions";
import { CashDeposit } from "./../database/models/business/cash-deposit.model";
import {
  NotificationFunctions,
  INotificationCreateInput,
} from "./../functions/notification.functions";
import { Notification } from "./../database/models/business/notification.model";
import { IActivateAccountRequest } from "./../functions/registration.functions";
import {
  IUserCreateInput,
  IRequestResetPasswordCodeInput,
  IResetPasswordInput,
  IChangePasswordInput,
} from "./../functions/security.functions";
import {
  IInvestmentCreateInput,
  IInvestmentPatchInput,
  InvestmentFunctions,
} from "./../functions/investment.functions";
import {
  IQuoteCreateInput,
  QuoteFunctions,
  IQuotePatchInput,
} from "./../functions/quote.functions";
import {
  InvestmentTypeFunctions,
  IInvestmentTypeCreateInput,
  IInvestmentTypePatchInput,
} from "./../functions/investment-type.functions";
import {
  Investment,
  InvestmentMovementTypeEnum,
} from "./../database/models/business/investment.model";
import { Quote } from "./../database/models/business/quote.model";
import { InvestmentType } from "./../database/models/business/investment-type.model";
import { ParameterFunctions } from "./../functions/parameter.functions";
import {
  Parameter,
  ParametersEnum,
} from "./../core/models/system/parameter.model";
import {
  IPumpCreateInput,
  PumpFunctions,
  IPumpPatchInput,
} from "./../functions/pump.functions";
import {
  IRefuelRequest,
  IWithdrawalRequest,
  ICustomerPatchInput,
  IShopPurchaseRequest,
  IUploadProfileImageRequest,
  ITransferWithdrawalRequest,
  ITransferRequest,
} from "./../functions/customer.functions";
import {
  AuthorizationStatusEnum,
  Authorization,
} from "./../database/models/business/authorization.model";
import { AuthorizationFunctions } from "./../functions/authorization.functions";
import { CashWithdrawal } from "./../database/models/business/cash-withdrawal.model";
import { ShopPurchase } from "./../database/models/business/shop-purchase.model";
import { FuelExchange } from "./../database/models/business/fuel-exchange.model";
import { Refuel } from "./../database/models/business/refuel.model";
import {
  SellerFunctions,
  ICashWithdrawalPaymentRequest,
  IShopPurchasePaymentRequest,
} from "./../functions/seller.functions";
import {
  IRegisterTokenInput,
  IUnregisterTokenInput,
} from "./../functions/user.functions";
import {
  FcmToken,
  FcmTokenStatusEnum,
} from "./../database/models/business/fcm-token.model";
import {
  PurchaseStatusEnum,
  PaymentMethodsEnum,
  Purchase,
} from "./../database/models/business/purchase.model";
import { GasTank } from "./../database/models/business/gas-tank.model";
import { GasStationAdministrator } from "./../database/models/business/gas-station-administrator.model";
import { generateData } from "./../data-generator/data-generator";
import { isProduction } from "./../core/env/env";
import {
  GasStationFunctions,
  IGasStationCreateInput,
  IGasStationPatchInput,
} from "../functions/gas-station.functions";
import { getLastPumpOperation } from "./../external/external-operations";
import { Pump } from "./../database/models/business/pump.model";
import { Seller } from "./../database/models/business/seller.model";
import { getAPIInfo } from "./../core/info/info";
import {
  CustomerFunctions,
  IAddFuelRequest,
  IExchangeFuelRequest,
  IRefuelResult,
} from "../functions/customer.functions";
import { IRegisterRequest } from "../functions/registration.functions";
import { Wallet } from "./../database/models/business/wallet.model";
import { User } from "./../database/models/business/user.model";
import { FuelType } from "./../database/models/business/fuel-type.model";
import { FuelPrice } from "./../database/models/business/fuel-price.model";
import { GasStation } from "./../database/models/business/gas-station.model";
import { Image } from "./../database/models/business/image.model";
import { Document } from "./../database/models/business/document.model";
import { DocumentType } from "./../database/models/business/document-type.model";
import {
  Customer,
  AccountStatusEnum,
} from "./../database/models/business/customer.model";
import { Role, RolesEnum } from "./../database/models/business/role.model";
import { EntityToGraphResolver } from "./../core/entity-resolver";
import {
  IDecodedToken,
  SecurityFunctions,
  ILoginRequest,
} from "../functions/security.functions";
import { IQueryCriteria } from "./../core/query-resolver";

import { GraphQLResolveInfo } from "graphql";

import { GraphQLDateTime, GraphQLDate } from "graphql-iso-date";
import { FuelTypeFunctions, IFuelTypePatchInput } from "../functions/fuel-type.functions";
import { WalletFunctions } from "../functions/wallet.functions";
import { UserFunctions } from "../functions/user.functions";
import { PubSub, withFilter } from "apollo-server-express";
import { CoverageOperator } from "./../database/models/business/coverage_operator.model";
import { TermsConditions } from "../database/models/business/terms-conditions";
import {
  IHelpContactInput,
  HelpCustomer,
} from "../functions/help-customer.function";
import { OperationTotalsByCustomer } from '../database/views/business/operations-totals-by-customer.view';
import { TransferWithdrawal } from '../database/models/business/transfer-withdrawal.model';
import { TransferWithdrawalFunctions } from '../functions/transfer-withdrawal.functions';
import { Transfer } from '../database/models/business/transfer.model';

export const AUTHORIZATION_REQUESTED = "AUTHORIZATION_REQUESTED";
export const TRANSFER_WITHDRAWAL_REQUESTED = "TRANSFER_WITHDRAWAL_REQUESTED";
export const pubsub = new PubSub();
export const gqlResolvers = {
  Query: {
    me: (
      _: any,
      __: any,
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.find<User>(context.user.id, User, info);
    },
    gracePeriod: async (
      _: any,
      __: any,
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return (await Parameter.getByName(ParametersEnum.GracePeriod))!
        .numberValue;
    },
    exchangeGracePeriod: async (
      _: any,
      __: any,
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return (await Parameter.getByName(ParametersEnum.ExchangeGracePeriod))!
        .numberValue;
    },
    purchaseMaxLitres: async (
      _: any,
      __: any,
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return (await Parameter.getByName(ParametersEnum.PurchaseMaxLitres))!
        .numberValue;
    },
    withdrawalMaxAmount: async (
      _: any,
      __: any,
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return (await Parameter.getByName(ParametersEnum.WithdrawalMaxAmount))!
        .numberValue;
    },
    withdrawalAmountMultiple: async (
      _: any,
      __: any,
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return (await Parameter.getByName(
        ParametersEnum.WithdrawalAmountMultiple
      ))!.numberValue;
    },
    paymentInStoreLimit: async (
      _: any,
      __: any,
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return (await Parameter.getByName(ParametersEnum.PaymentInStoreLimit))!
        .numberValue;
    },
    contactHelpEmails: async (
      _: any,
      __: any,
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return (await Parameter.getByName(ParametersEnum.ContactHelpEmails))!
        .textValue;
    },
    walletLitresLimit: async (
      _: any,
      __: any,
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return (await Parameter.getByName(ParametersEnum.WalletLitresLimit))!
        .numberValue;
    },
    accountLitresLimit: async (
      _: any,
      __: any,
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return (await Parameter.getByName(ParametersEnum.AccountLitresLimit))!
        .numberValue;
    },
    roles: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.list<Role>(Role, info, criteria);
    },
    roleById: (
      obj: any,
      { id }: { id: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.find<Role>(id, Role, info);
    },
    customers: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      //SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.list<Customer>(Customer, info, criteria);
    },
    customerById: (
      obj: any,
      { id }: { id: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.find<Customer>(id, Customer, info);
    },
    authorizations: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      //SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.list<Authorization>(
        Authorization,
        info,
        criteria
      );
    },
    authorizationById: (
      obj: any,
      { id }: { id: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.find<Authorization>(id, Authorization, info);
    },
    documentTypes: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.list<DocumentType>(
        DocumentType,
        info,
        criteria
      );
    },
    documentTypeById: (
      obj: any,
      { id }: { id: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.find<DocumentType>(id, DocumentType, info);
    },
    documents: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.list<Document>(Document, info, criteria);
    },
    documentById: (
      obj: any,
      { id }: { id: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => EntityToGraphResolver.find<Document>(id, Document, info),
    images: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.list<Image>(Image, info, criteria);
    },
    imageById: (
      obj: any,
      { id }: { id: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.find<Document>(id, Document, info);
    },
    gasStations: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.list<GasStation>(GasStation, info, criteria);
    },
    gasStationById: (
      obj: any,
      { id }: { id: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.find<GasStation>(id, GasStation, info);
    },
    pumps: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.list<Pump>(Pump, info, criteria);
    },
    pumpById: (
      obj: any,
      { id }: { id: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.find<Pump>(id, Pump, info);
    },
    fuelPrices: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.list<FuelPrice>(FuelPrice, info, criteria);
    },
    fuelPriceById: (
      obj: any,
      { id }: { id: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.find<FuelPrice>(id, FuelPrice, info);
    },
    fuelTypes: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      return EntityToGraphResolver.list<FuelType>(FuelType, info, criteria);
    },
    fuelTypeById: (
      obj: any,
      { id }: { id: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.find<FuelType>(id, FuelType, info);
    },
    users: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.list<User>(User, info, criteria);
    },
    userById: (
      obj: any,
      { id }: { id: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.find<User>(id, User, info);
    },
    fcmTokens: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.list<FcmToken>(FcmToken, info, criteria);
    },
    fcmTokenById: (
      obj: any,
      { id }: { id: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.find<FcmToken>(id, FcmToken, info);
    },
    wallets: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.list<Wallet>(Wallet, info, criteria);
    },
    walletById: (
      obj: any,
      { id }: { id: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.find<Wallet>(id, Wallet, info);
    },
    sellers: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.list<Seller>(Seller, info, criteria);
    },
    sellerById: (
      obj: any,
      { id }: { id: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.find<Seller>(id, Seller, info);
    },
    gasStationAdministrators: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.list<GasStationAdministrator>(
        GasStationAdministrator,
        info,
        criteria
      );
    },
    gasStationAdministratorById: (
      obj: any,
      { id }: { id: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.find<GasStationAdministrator>(
        id,
        GasStationAdministrator,
        info
      );
    },
    coverageOperators: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.list<CoverageOperator>(
        CoverageOperator,
        info,
        criteria
      );
    },
    coverageOperatorById: (
      obj: any,
      { id }: { id: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.find<CoverageOperator>(
        id,
        CoverageOperator,
        info
      );
    },
    investmentTypes: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.list<InvestmentType>(
        InvestmentType,
        info,
        criteria
      );
    },
    investmentTypeById: (
      obj: any,
      { id }: { id: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.find<InvestmentType>(
        id,
        InvestmentType,
        info
      );
    },
    quotes: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.list<Quote>(Quote, info, criteria);
    },
    quoteById: (
      obj: any,
      { id }: { id: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.find<Quote>(id, Quote, info);
    },
    investments: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.list<Investment>(Investment, info, criteria);
    },
    investmentById: (
      obj: any,
      { id }: { id: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.find<Investment>(id, Investment, info);
    },
    gasTanks: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.list<GasTank>(GasTank, info, criteria);
    },
    gasTankById: (
      obj: any,
      { id }: { id: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.find<GasTank>(id, GasTank, info);
    },
    purchases: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.list<Purchase>(Purchase, info, criteria);
    },
    purchaseById: (
      obj: any,
      { id }: { id: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.find<Purchase>(id, Purchase, info);
    },
    refuels: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.list<Refuel>(Refuel, info, criteria);
    },
    refuelById: (
      obj: any,
      { id }: { id: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.find<Refuel>(id, Refuel, info);
    },
    fuelExchanges: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.list<FuelExchange>(
        FuelExchange,
        info,
        criteria
      );
    },
    fuelExchangeById: (
      obj: any,
      { id }: { id: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.find<FuelExchange>(id, FuelExchange, info);
    },
    shopPurchases: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.list<ShopPurchase>(
        ShopPurchase,
        info,
        criteria
      );
    },
    shopPurchaseById: (
      obj: any,
      { id }: { id: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.find<ShopPurchase>(id, ShopPurchase, info);
    },
    cashWithdrawals: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.list<CashWithdrawal>(
        CashWithdrawal,
        info,
        criteria
      );
    },
    cashWithdrawalById: (
      obj: any,
      { id }: { id: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.find<CashWithdrawal>(
        id,
        CashWithdrawal,
        info
      );
    },
    transferWithdrawals: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(
        context,
        RolesEnum.Administrator
      );
      return EntityToGraphResolver.list<TransferWithdrawal>(
        TransferWithdrawal,
        info,
        criteria
      );
    },
    transferWithdrawalById: (
      obj: any,
      { id }: { id: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(
        context,
        RolesEnum.Administrator
      );
      return EntityToGraphResolver.find<TransferWithdrawal>(
        id,
        TransferWithdrawal,
        info
      );
    },
    transfers: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(
        context,
        RolesEnum.Administrator
      );
      return EntityToGraphResolver.list<Transfer>(
        Transfer,
        info,
        criteria
      );
    },
    transferById: (
      obj: any,
      { id }: { id: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(
        context,
        RolesEnum.Administrator
      );
      return EntityToGraphResolver.find<Transfer>(
        id,
        Transfer,
        info
      );
    },
    operations: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.list<Operation>(Operation, info, criteria);
    },
    operationTotalsByCustomer: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.list<OperationTotalsByCustomer>(OperationTotalsByCustomer, info, criteria);
    },
    operationTotalsByFuelType: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return EntityToGraphResolver.list<OperationTotalsByFuelType>(OperationTotalsByFuelType, info, criteria);
    },
    notifications: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(
        context,
        RolesEnum.Administrator,
        RolesEnum.GasStationAdministrator,
        RolesEnum.Customer
      );
      return EntityToGraphResolver.list<Notification>(
        Notification,
        info,
        criteria
      );
    },
    notificationById: (
      obj: any,
      { id }: { id: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(
        context,
        RolesEnum.Administrator,
        RolesEnum.GasStationAdministrator
      );
      return EntityToGraphResolver.find<Notification>(id, Notification, info);
    },
    cashDeposits: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(
        context,
        RolesEnum.Administrator,
        RolesEnum.GasStationAdministrator
      );
      return EntityToGraphResolver.list<CashDeposit>(
        CashDeposit,
        info,
        criteria
      );
    },
    cashDepositById: (
      obj: any,
      { id }: { id: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(
        context,
        RolesEnum.Administrator,
        RolesEnum.GasStationAdministrator
      );
      return EntityToGraphResolver.find<CashDeposit>(id, CashDeposit, info);
    },

    isGasStationInRadio: (
      obj: any,
      { lat, lng, distance }: { lat: number; lng: number; distance: number },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      return GasStationFunctions.isGasStationsInRadiusFilter(
        lat,
        lng,
        distance
      );
    },

    termsAndConditions: (
      obj: any,
      { criteria }: { criteria: IQueryCriteria },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      return EntityToGraphResolver.list<TermsConditions>(
        TermsConditions,
        info,
        criteria
      );
    },
    customerSearch: async (
      _: any,
      { search }: { search: string },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Customer);
      return CustomerFunctions.customerSearch(search, info, context);
    },
    apiInfo: async (_: any, __: any, context: { user: IDecodedToken }) => {
      return getAPIInfo();
    },
  },
  Pump: {
    lastExternalOperation: (
      parent: Pump,
      _: any,
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      //return mockGetLastPumpOperation(parent.id, info);
      return getLastPumpOperation(parent.id as number, info);
    },
  },
  Wallet: {
    availableLitres: (
      parent: Wallet,
      { dueDate }: { dueDate?: Date },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      return WalletFunctions.availableLitres(parent.id as number, dueDate);
    },
  },
  GasStation: {
    pumpsCount: (
      parent: GasStation,
      _: any,
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      return GasStationFunctions.countPumps(parent.id as number);
    },
  },
  FuelType: {
    currentPrice: (
      parent: FuelType,
      _: any,
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      return FuelTypeFunctions.currentPrice(parent.id as number, info);
    },
    previousPrice: (
      parent: FuelType,
      _: any,
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      return FuelTypeFunctions.previousPrice(parent.id as number, info);
    },
  },
  Mutation: {
    login: async (
      obj: any,
      { credentials }: { credentials: ILoginRequest },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => SecurityFunctions.login(credentials, info),
    register: async (
      obj: any,
      { data }: { data: IRegisterRequest },
      context: { user: IDecodedToken },
      info: any
    ) => CustomerFunctions.register(data, info),
    activateAccount: async (
      obj: any,
      { data }: { data: IActivateAccountRequest },
      context: { user: IDecodedToken },
      info: any
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return CustomerFunctions.activateAccount(data, context);
    },
    resendActivationCode: async (
      obj: any,
      _: any,
      context: { user: IDecodedToken },
      info: any
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return CustomerFunctions.resendActivationCode(context);
    },
    requestResetPasswordCode: async (
      obj: any,
      { data }: { data: IRequestResetPasswordCodeInput },
      context: { user: IDecodedToken },
      info: any
    ) => {
      return SecurityFunctions.requestResetPasswordCode(data);
    },
    resetPassword: async (
      obj: any,
      { data }: { data: IResetPasswordInput },
      context: { user: IDecodedToken },
      info: any
    ) => {
      return SecurityFunctions.resetPassword(data);
    },
    changePassword: async (
      obj: any,
      { data }: { data: IChangePasswordInput },
      context: { user: IDecodedToken },
      info: any
    ) => {
      return SecurityFunctions.changePassword(data, context);
    },
    updateGracePeriod: async (
      obj: any,
      { data }: { data: { value: number } },
      context: { user: IDecodedToken }
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Administrator);
      return ParameterFunctions.setGracePeriod(data.value);
    },
    updateExchangeGracePeriod: async (
      obj: any,
      { data }: { data: { value: number } },
      context: { user: IDecodedToken }
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Administrator);
      return ParameterFunctions.setExchangeGracePeriod(data.value);
    },
    updatePurchaseMaxLitres: async (
      obj: any,
      { data }: { data: { value: number } },
      context: { user: IDecodedToken }
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Administrator);
      return ParameterFunctions.setPurchaseMaxLitres(data.value);
    },
    updateWithdrawalMaxAmount: async (
      obj: any,
      { data }: { data: { value: number } },
      context: { user: IDecodedToken }
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Administrator);
      return ParameterFunctions.setWithdrawalMaxAmount(data.value);
    },
    updateWithdrawalAmountMultiple: async (
      obj: any,
      { data }: { data: { value: number } },
      context: { user: IDecodedToken }
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Administrator);
      return ParameterFunctions.setWithdrawalAmountMultiple(data.value);
    },
    updatePaymentInStoreLimit: async (
      obj: any,
      { data }: { data: { value: number } },
      context: { user: IDecodedToken }
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Administrator);
      return ParameterFunctions.setPaymentInStoreLimit(data.value);
    },
    updateAccountLitresLimit: async (
      obj: any,
      { data }: { data: { value: number } },
      context: { user: IDecodedToken }
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Administrator);
      return ParameterFunctions.setAccountLitresLimit(data.value);
    },
    updateWalletLitresLimit: async (
      obj: any,
      { data }: { data: { value: number } },
      context: { user: IDecodedToken }
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Administrator);
      return ParameterFunctions.setWalletLitresLimit(data.value);
    },
    updateContactHelpEmails: async (
      obj: any,
      { data }: { data: { value: string } },
      context: { user: IDecodedToken }
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Administrator);
      return ParameterFunctions.setContactHelpEmails(data.value);
    },
    updateWithdrawalNotificationEmails: async (
      obj: any,
      { data }: { data: { value: string } },
      context: { user: IDecodedToken }
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Administrator);
      return ParameterFunctions.setWithdrawalNotificationEmails(data.value);
    },
    HelpCustomerSendQuery: async (
      obj: any,
      { data }: { data: IHelpContactInput },
      context: { user: IDecodedToken },
      info: any
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Customer);
      return HelpCustomer.sendHelpQuery(data, info, context);
    },
    registerFcmToken: async (
      obj: any,
      { data }: { data: IRegisterTokenInput },
      context: { user: IDecodedToken },
      info: any
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return UserFunctions.registerFcmToken(data, context);
    },
    unregisterFcmToken: async (
      obj: any,
      { data }: { data: IUnregisterTokenInput },
      context: { user: IDecodedToken },
      info: any
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return UserFunctions.unregisterFcmToken(data, context);
    },
    requestAddFuelToWallet: async (
      obj: any,
      { data }: { data: IAddFuelRequest },
      context: { user: IDecodedToken },
      info: any
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Customer);
      return CustomerFunctions.requestAddFuelToWallet(data, info, context);
    },
    requestCashWithdrawalPayment: async (
      obj: any,
      { data }: { data: ICashWithdrawalPaymentRequest },
      context: { user: IDecodedToken },
      info: any
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Seller);
      return SellerFunctions.requestCashWithdrawalPayment(data);
    },
    requestShopPurchasePayment: async (
      obj: any,
      { data }: { data: IShopPurchasePaymentRequest },
      context: { user: IDecodedToken },
      info: any
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Seller);
      return SellerFunctions.requestShopPurchasePayment(data);
    },
    refuel: async (
      obj: any,
      { data }: { data: IRefuelRequest },
      context: { user: IDecodedToken },
      info: any
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Customer);
      return CustomerFunctions.refuel(data, info, context);
    },
    withdrawal: async (
      obj: any,
      { data }: { data: IWithdrawalRequest },
      context: { user: IDecodedToken },
      info: any
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Customer);
      return CustomerFunctions.withdrawal(data, info, context);
    },
    transferWithdrawal: async (
      obj: any,
      { data }: { data: ITransferWithdrawalRequest },
      context: { user: IDecodedToken },
      info: any
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Customer);
      return CustomerFunctions.transferWithdrawal(data, info, context);
    },
    acceptTransferWithdrawal: async (
      _: any,
      { data }: { data: { id: number, code: string } },
      context: { user: IDecodedToken },
      info: any
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Administrator);
      return TransferWithdrawalFunctions.acceptTransferWithdrawal(data.id, data.code, context.user.id);
    },
    rejectTransferWithdrawal: async (
      _: any,
      { data }: { data: { id: number } },
      context: { user: IDecodedToken },
      info: any
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Administrator);
      return TransferWithdrawalFunctions.rejectTransferWithdrawal(data.id, context.user.id);
    },
    shopPurchase: async (
      obj: any,
      { data }: { data: IShopPurchaseRequest },
      context: { user: IDecodedToken },
      info: any
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Customer);
      return CustomerFunctions.shopPurchase(data, info, context);
    },
    exchangeFuel: async (
      _: any,
      { data }: { data: IExchangeFuelRequest },
      context: { user: IDecodedToken },
      info: any
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Customer);
      return CustomerFunctions.exchangeFuel(data, info, context);
    },
    grantDniAuthorization: async (
      _: any,
      { data }: { data: { id: number } },
      context: { user: IDecodedToken },
      info: any
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Seller);
      return AuthorizationFunctions.grantAuthorization(data.id);
    },
    rejectDniAuthorization: async (
      _: any,
      { data }: { data: { id: number } },
      context: { user: IDecodedToken },
      info: any
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Seller);
      return AuthorizationFunctions.rejectAuthorization(data.id);
    },
    transfer: async (
      obj: any,
      { data }: { data: ITransferRequest },
      context: { user: IDecodedToken },
      info: any
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Customer);
      return CustomerFunctions.transfer(data, info, context);
    },
    fuelTypeEdit: async (
      _: any,
      { data }: { data: IFuelTypePatchInput },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Administrator);
      return FuelTypeFunctions.edit(data, info);
    },
    customerEdit: async (
      _: any,
      { data }: { data: ICustomerPatchInput },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Administrator);
      return CustomerFunctions.edit(data, info);
    },
    gasStationCreate: async (
      _: any,
      { data }: { data: IGasStationCreateInput },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Administrator);
      return GasStationFunctions.create(data, info);
    },
    gasStationEdit: async (
      _: any,
      { data }: { data: IGasStationPatchInput },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Administrator);
      return GasStationFunctions.edit(data, info);
    },
    pumpCreate: async (
      _: any,
      { data }: { data: IPumpCreateInput },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Administrator);
      return PumpFunctions.create(data, info);
    },
    pumpEdit: async (
      _: any,
      { data }: { data: IPumpPatchInput },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Administrator);
      return PumpFunctions.edit(data, info);
    },
    investmentTypeCreate: async (
      _: any,
      { data }: { data: IInvestmentTypeCreateInput },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(
        context,
        RolesEnum.Administrator,
        RolesEnum.CoverageOperator
      );
      return InvestmentTypeFunctions.create(data, info);
    },
    investmentTypeEdit: async (
      _: any,
      { data }: { data: IInvestmentTypePatchInput },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(
        context,
        RolesEnum.Administrator,
        RolesEnum.CoverageOperator
      );
      return InvestmentTypeFunctions.edit(data, info);
    },
    quoteCreate: async (
      _: any,
      { data }: { data: IQuoteCreateInput },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(
        context,
        RolesEnum.Administrator,
        RolesEnum.CoverageOperator
      );
      return QuoteFunctions.create(data, info);
    },
    quoteEdit: async (
      _: any,
      { data }: { data: IQuotePatchInput },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(
        context,
        RolesEnum.Administrator,
        RolesEnum.CoverageOperator
      );
      return QuoteFunctions.edit(data, info);
    },
    investmentCreate: async (
      _: any,
      { data }: { data: IInvestmentCreateInput },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(
        context,
        RolesEnum.Administrator,
        RolesEnum.CoverageOperator
      );
      return InvestmentFunctions.create(data, info);
    },
    userCreate: async (
      _: any,
      { data }: { data: IUserCreateInput },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      return SecurityFunctions.createUser(data, context, info);
    },
    notificationCreate: async (
      _: any,
      { data }: { data: INotificationCreateInput },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(
        context,
        RolesEnum.Administrator,
        RolesEnum.GasStationAdministrator
      );
      return NotificationFunctions.create(data, info);
    },
    cashDepositCreate: async (
      _: any,
      { data }: { data: ICashDepositCreateInput },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(
        context,
        RolesEnum.GasStationAdministrator
      );
      return CashDepositFunctions.create(data, info, context);
    },
    investmentEdit: async (
      _: any,
      { data }: { data: IInvestmentPatchInput },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(
        context,
        RolesEnum.Administrator,
        RolesEnum.CoverageOperator
      );
      return InvestmentFunctions.edit(data, info);
    },
    editProfile: async (
      _: any,
      { data }: { data: ICustomerPatchInput },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Customer);
      return CustomerFunctions.editProfile(data, info, context);
    },

    uploadImageProfile: async (
      _: any,
      { data }: { data: IUploadProfileImageRequest },
      context: { user: IDecodedToken },
      info: GraphQLResolveInfo
    ) => {
      SecurityFunctions.mustBeAuthenticated(context);
      SecurityFunctions.mustHaveRole(context, RolesEnum.Customer);
      return CustomerFunctions.uploadImageProfile(data, info, context);
    },
    loadDemoData: async () => {
      if (!isProduction) {
        await generateData();
        return {
          ok: true,
        };
      } else {
        throw "only available in non production environments";
      }
    },
  },
  Subscription: {
    authorizationRequested: {
      // Additional event labels can be passed to asyncIterator creation
      subscribe: withFilter(
        () => pubsub.asyncIterator(AUTHORIZATION_REQUESTED),
        async (
          { authorizationRequested }: { authorizationRequested: Authorization },
          { gasStationId }: { gasStationId: string }
        ) => {
          const id =
            (
              await (await (await authorizationRequested.refuel)?.pump)
                ?.gasStation
            )?.id ||
            (await (
              await (await authorizationRequested.cashWithdrawal)?.gasStation
            )?.id) ||
            (await (await (await authorizationRequested.purchase)?.gasStation)
              ?.id) ||
            (await (
              await (await authorizationRequested.shopPurchase)?.gasStation
            )?.id);
          return id === +gasStationId;
        }
      ),
    },
    transferWithdrawalRequested: {
      subscribe: () => pubsub.asyncIterator([TRANSFER_WITHDRAWAL_REQUESTED]),
    },
  },
};

export const scalarResolvers = {
  //JSON: GraphQLJSON
  DateTime: GraphQLDateTime,
  Date: GraphQLDate,
  AccountStatus: {
    ACTIVE: AccountStatusEnum.Active,
    INACTIVE: AccountStatusEnum.Inactive,
  },
  PurchaseStatus: {
    COMPLETED: PurchaseStatusEnum.Completed,
    PENDING: PurchaseStatusEnum.Pending,
  },
  PaymentMethods: {
    CASH: PaymentMethodsEnum.Cash,
    MERCADOPAGO: PaymentMethodsEnum.Mercadopago,
  },
  UserRoles: {
    CUSTOMER: RolesEnum.Customer,
    ADMINISTRATOR: RolesEnum.Administrator,
    SELLER: RolesEnum.Seller,
    GAS_STATION_ADMINISTRATOR: RolesEnum.GasStationAdministrator,
    COVERAGE_OPERATOR: RolesEnum.CoverageOperator,
  },
  FcmTokenStatus: {
    ACTIVE: FcmTokenStatusEnum.Active,
    INACTIVE: FcmTokenStatusEnum.Inactive,
  },
  AuthorizationStatus: {
    PENDING: AuthorizationStatusEnum.Pending,
    AUTHORIZED: AuthorizationStatusEnum.Authorized,
    REJECTED: AuthorizationStatusEnum.Rejected,
  },
  InvestmentMovementType: {
    PURCHASE: InvestmentMovementTypeEnum.Purchase,
    SALE: InvestmentMovementTypeEnum.Sale,
  },
};
