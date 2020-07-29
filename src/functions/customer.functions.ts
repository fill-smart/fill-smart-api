import jwt from "jsonwebtoken";
import { pubsub, AUTHORIZATION_REQUESTED, TRANSFER_WITHDRAWAL_REQUESTED } from "./../gql/resolvers";
import { FuelTypeFunctions } from "./fuel-type.functions";
import { getLastPumpOperation, confirmRefuelOperation } from "./../external/external-operations";
import {
  Authorization,
  AuthorizationStatusEnum
} from "./../database/models/business/authorization.model";
import { MercadoPago, PreferenceInput } from "./mercado-pago.functions";
import {
  Purchase,
  PaymentMethodsEnum,
  PurchaseStatusEnum
} from "./../database/models/business/purchase.model";
import { EntityToGraphResolver } from "../core/entity-resolver";
import {
  StringUtils,
  NumberUtils
} from "@silentium-apps/fill-smart-common/utils";

import { RolesEnum, Role } from "../database/models/business/role.model";
import { Wallet } from "../database/models/business/wallet.model";
import { getManager, useContainer } from "typeorm";
import { GraphQLResolveInfo, NoUnusedFragmentsRule } from "graphql";
import {
  getInfoFromSubfield,
  GraphQLPartialResolveInfo
} from "../core/gql/utils";
import {
  Customer,
  AccountStatusEnum
} from "../database/models/business/customer.model";
import {
  IDecodedToken,
  encryptPassword,
  ILoginResult
} from "./security.functions";
import { FuelType } from "../database/models/business/fuel-type.model";
import { FuelPrice } from "../database/models/business/fuel-price.model";
import {
  IRegisterRequest,
  IRegisterResult,
  IActivateAccountRequest,
  IActivateAccountResult
} from "./registration.functions";
import { User } from "../database/models/business/user.model";
import moment from "moment";
import { getCurrentEnvironmentalConfig } from "../core/env/env";
import { Pump } from "../database/models/business/pump.model";
import { Refuel } from "../database/models/business/refuel.model";
import { FuelExchange } from "../database/models/business/fuel-exchange.model";
import { CashWithdrawal } from "../database/models/business/cash-withdrawal.model";
import { GasStation } from "../database/models/business/gas-station.model";
import { ShopPurchase } from "../database/models/business/shop-purchase.model";
import { Document } from "../database/models/business/document.model";
import { DocumentType } from "../database/models/business/document-type.model";
import { Image as ImageDocument } from "../database/models/business/image.model";
import Mailer from "../core/mailing/mailer";
import Jimp from "jimp";
import { ParametersEnum, Parameter } from "../core/models/system/parameter.model";
import e from "express";
import { TransferWithdrawal } from "../database/models/business/transfer-withdrawal.model";
import { Transfer } from "../database/models/business/transfer.model";
import { SendFcmToCustomer } from "../firebase/firebase";
import { Notification } from "../database/models/business/notification.model";
import { Notifications } from "../firebase/fcm-notifications";

export interface IAddFuelRequest {
  fuelTypeId: number;
  litres: number;
  paymentMethod: PaymentMethodsEnum;
  gasStationId?: number;
}

export interface IAddFuelResult {
  purchase: Purchase;
}

export interface IRefuelRequest {
  fuelTypeId: number;
  pumpId: number;
}

export interface IRefuelResult {
  refuel: Refuel;
}

export interface IWithdrawalRequest {
  fuelTypeId: number;
  amount: number;
  gasStationId: number;
}

export interface ITransferWithdrawalRequest {
  fuelTypeId: number;
  amount: number;
  accountType: string;
}

export interface IWithdrawalResult {
  withdrawal: CashWithdrawal;
}

export interface IShopPurchaseRequest {
  fuelTypeId: number;
  amount: number;
  gasStationId: number;
}

export interface IShopPurchaseResult {
  shopPurchase: ShopPurchase;
}

export interface IExchangeFuelRequest {
  sourceFuelTypeId: number;
  targetFuelTypeId: number;
  sourceLitres: number;
}

export interface IExchangeFuelResult {
  ok: boolean;
  receiptId: string;
}

export interface ITransferRequest {
  fuelTypeId: number;
  targetCustomerId: number;
  targetLitres: number;
}

export interface ITransferResult {
  transfer: Transfer;
}

type PartialCustomer = Pick<Customer, "id"> & Partial<Customer>;

export interface ICustomerPatchInput extends PartialCustomer { 
  email?: string;
}

export interface IUploadProfileImageRequest {
  image: string;
}

export interface IUploadProfileImageResult {
  customer: Customer
}

export const CustomerFunctions = {
  register: async (data: IRegisterRequest, info: GraphQLResolveInfo) => {
    return new Promise<ILoginResult>(async (resolve, reject) => {
      try {
        await getManager().transaction(async em => {
          const user = new User();
          user.username = data.username;
          user.roles = Promise.resolve([
            await Role.getByName(RolesEnum.Customer, em)
          ]);
          user.password = await encryptPassword(data.password);
          const savedUser = await em.save(user);
          const activationCode = NumberUtils.randomBetween(1, 9999)
            .toString()
            .padStart(4, "0");
          const customer = new Customer();
          if (!data.firstName || !data.lastName) {
            throw "First name and last name must not be empty."
          }
          customer.firstName = StringUtils.toTitleCase(data.firstName.trim());
          customer.lastName = StringUtils.toTitleCase(data.lastName.trim());
          customer.user = Promise.resolve(savedUser);
          customer.documentNumber = data.documentNumber;
          customer.phone = data.phone;
          customer.status = AccountStatusEnum.Inactive;
          customer.activationCode = activationCode;
          const savedCustomer = await em.save(customer);

          //Save DNI images FRONT and BACK
          try {
            if (data.dniFrontImage) {
              const documentTypeDniFront = <DocumentType>(
                await DocumentType.getByDocumentName("Frente DNI")
              );
              if (!documentTypeDniFront) {
                throw "Document Type Frente DNI does not exists";
              }

              let docDniFront = new Document();
              docDniFront.name = documentTypeDniFront.name;
              docDniFront.documentType = Promise.resolve(documentTypeDniFront);
              docDniFront.customer = Promise.resolve(customer);
              docDniFront = await em.save(docDniFront);

              const imageDniFront = new ImageDocument();
              imageDniFront.document = Promise.resolve(docDniFront);
              ImageDocument.createAndStore(
                imageDniFront,
                data.dniFrontImage,
                data.imagesRotation
              );
            }

            if (data.dniBackImage) {
              const documentTypeDniBack = <DocumentType>(
                await DocumentType.getByDocumentName("Dorso DNI")
              );
              if (!documentTypeDniBack) {
                throw "Document Type Dorso DNI does not exists";
              }

              let docDniBack = new Document();
              docDniBack.name = documentTypeDniBack.name;
              docDniBack.documentType = Promise.resolve(documentTypeDniBack);
              docDniBack.customer = Promise.resolve(customer);
              docDniBack = await em.save(docDniBack);

              const imageDniBack = new ImageDocument();
              imageDniBack.document = Promise.resolve(docDniBack);
              ImageDocument.createAndStore(
                imageDniBack,
                data.dniBackImage,
                data.imagesRotation
              );
            }
          } catch (ex) {
            console.log(ex);
            throw "Error saving document DNI images";
          }

          //We need to create the wallets for each fuel type
          const fuelTypes = await FuelType.getAll(em);
          for (let i = 0; i < fuelTypes.length; i++) {
            const wallet = new Wallet();
            wallet.customer = Promise.resolve(savedCustomer);
            wallet.fuelType = Promise.resolve(fuelTypes[i]);
            wallet.litres = 0;
            await em.save(wallet);
          }

          await Mailer.sendActivationCode(activationCode, data.username);

          const secretTokeSign = (await getCurrentEnvironmentalConfig())
            .secretToken;
          const subinfo = <GraphQLPartialResolveInfo>(
            getInfoFromSubfield("user", info)
          );
          const populatedCustomer = <User>(
            await EntityToGraphResolver.find<User>(
              savedUser.id as number,
              User,
              subinfo,
              em
            )
          );
          resolve({
            user: populatedCustomer,
            token: jwt.sign(
              {
                id: savedUser.id,
                username: savedUser.username,
                roles: (await savedUser.roles)?.map(role => role.name)
              },
              secretTokeSign
            )
          });
        });
      } catch (ex) {
        reject(ex);
      }
    });
  },

  activateAccount: async (
    data: IActivateAccountRequest,
    { user }: { user: IDecodedToken }
  ) => {
    return new Promise<IActivateAccountResult>(async (resolve, reject) => {
      try {
        await getManager().transaction(async em => {
          const customer = await em
            .createQueryBuilder(Customer, "c")
            .leftJoin("c.user", "u")
            .where("u.id = :userId", { userId: user.id })
            .getOne();
          if (!customer) {
            throw "No customer for user";
          }
          if (customer.activationCode !== data.code) {
            throw "Code does not match";
          }
          customer.status = AccountStatusEnum.Active;
          await em.save(customer);
          resolve({
            success: true
          });
        });
      } catch (ex) {
        reject(ex);
      }
    });
  },

  resendActivationCode: async ({ user }: { user: IDecodedToken }) => {
    return new Promise<IActivateAccountResult>(async (resolve, reject) => {
      try {
        await getManager().transaction(async em => {
          const customer = await em
            .createQueryBuilder(Customer, "c")
            .leftJoin("c.user", "u")
            .where("u.id = :userId", { userId: user.id })
            .getOne();
          if (!customer) {
            throw "No customer for user";
          }
          await Mailer.sendActivationCode(
            customer.activationCode,
            (await customer.user)!.username
          );
          resolve({
            success: true
          });
        });
      } catch (ex) {
        reject(ex);
      }
    });
  },

  edit: async (
    { id, email, ...data }: ICustomerPatchInput,
    info: GraphQLResolveInfo,
  ) => {
    return new Promise<Customer | null>(async (resolve, reject) => {
      try {
        await getManager().transaction(async em => {
          const customer = await em.findOne(Customer, id as number);
          const savedCustomer = await em.save(Object.assign(customer, data));
          if (email) {
            const user: User|undefined = await em.createQueryBuilder()
            .relation(Customer, "user")
            .of(savedCustomer)
            .loadOne();
            if (user) {
              user.username = email;
              em.save(user);
            }
          }
          resolve(await EntityToGraphResolver.find<Customer>(id as number, Customer, info, em));
        })
      }
      catch (ex) {
        reject(ex);
      }
    })
  },

  editProfile: async (
    { ...data }: ICustomerPatchInput,
    info: GraphQLResolveInfo,
    { user }: { user: IDecodedToken }
  ) => {
    const customer = <Customer>(await Customer.getByUser(user.id));
    await Customer.update(customer.id as number, data);
    return await EntityToGraphResolver.find<Customer>(customer.id as number, Customer, info);
  },

  uploadImageProfile: async (
    data: IUploadProfileImageRequest,
    info: GraphQLResolveInfo,
    { user }: { user: IDecodedToken }
  ) => {
    return new Promise<IUploadProfileImageResult>(async (resolve, reject) => {
      try {
        const customer = <Customer>(await Customer.getByUser(user.id));
        if (!customer) {
          throw "No customer for user";
        }
        //Write image profile
        (await Jimp.read(Buffer.from(data.image, "base64")))
          .quality(60)
          .write(`${__dirname}/../uploads/profiles/${customer.id}.jpg`);
        resolve({ customer });
      }
      catch (ex) {
        reject(ex);
      }
    })
  },

  requestAddFuelToWallet: async (
    data: IAddFuelRequest,
    info: GraphQLResolveInfo,
    { user }: { user: IDecodedToken }
  ) => {
    return new Promise<IAddFuelResult>(async (resolve, reject) => {
      try {
        await getManager().transaction(async em => {
          const purchaseMaxLitres = (await Parameter.getByName(ParametersEnum.PurchaseMaxLitres))!.numberValue;
          const walletLitresLimit = (await Parameter.getByName(ParametersEnum.WalletLitresLimit))!.numberValue;
          const accountLitresLimit = (await Parameter.getByName(ParametersEnum.AccountLitresLimit))!.numberValue;

          if (data.litres > purchaseMaxLitres!) {
            throw "Purchase max litres exceeded.";
          }

          const wallets = await em
            .createQueryBuilder(Wallet, "w")
            .select("w.litres")
            .innerJoin("w.customer", "c")
            .innerJoin("c.user", "u")
            .where("u.id = :userId", {
              userId: user.id
            })
            .getMany();
          
          const litresInAccount = wallets.reduce((previous, current) => (current.litres + previous), 0);

          if ((data.litres + litresInAccount) > accountLitresLimit!) {
            throw "Account litre limit exceeded.";
          }

          const customer = await Customer.getByUser(user.id, em);
          if (!customer) {
            throw "User has no customer";
          }
          const wallet = <Wallet>(
            await Wallet.getByCustomerAndFuelType(customer.id as number, data.fuelTypeId)
          );
          if (!wallet) {
            throw "Customer has no wallet for the given fuel type";
          }
          
          if ((data.litres + wallet.litres) > walletLitresLimit!) {
            throw "Wallet litre limit exceeded.";
          }

          const fuelTypeId = (await wallet.fuelType)?.id;
          const { currentPriceId } = <{ currentPriceId: number }>await em
            .createQueryBuilder(FuelPrice, "p")
            .select("p.id", "currentPriceId")
            .leftJoin("p.fuelType", "t")
            .where("t.id = :fuelTypeId AND p.to is null", {
              fuelTypeId
            })
            .getRawOne();
          const fuelPrice = <FuelPrice>(
            await FuelPrice.getById(currentPriceId, em)
          );
          const purchaseTotal = fuelPrice.price * data.litres;

          const purchase = new Purchase();
          purchase.litres = data.litres;
          purchase.paymentMethod = data.paymentMethod;
          purchase.wallet = Promise.resolve(wallet);
          purchase.fuelPrice = Promise.resolve(fuelPrice);
          purchase.status = PurchaseStatusEnum.Pending;
          const loggedUser = <User>await User.getById(user.id);
          const prePurchase = await em.save(purchase);
          if (data.paymentMethod === PaymentMethodsEnum.Mercadopago) {
            const mpDateFormat = "YYYY[-]MM[-]DD[T]HH:mm:ss[.]SSS[-03:00]";
            const serverUrl = `${
              (await getCurrentEnvironmentalConfig()).serverUrl
              }/ipn/${purchase.id}`;
            const preferenceInput: PreferenceInput = {
              items: [
                {
                  title: <string>(await wallet.fuelType)?.name,
                  description: "Compra de Combustible - FillSmart",
                  quantity: 1,
                  currency_id: "ARS",

                  unit_price: purchaseTotal
                }
              ],
              payer: {
                email: await loggedUser.username
              },
              expires: true,
              expiration_date_from: moment().format(mpDateFormat),
              expiration_date_to: moment()
                .add(1, "day")
                .format(mpDateFormat),
              external_reference: prePurchase.id.toString(),
              notification_url: serverUrl
            };
            const preference = await MercadoPago.Preference.create(
              preferenceInput
            );
            prePurchase.preferenceId = preference.id;
            prePurchase.preferenceUrl = preference.init_point;

          } else if (data.paymentMethod === PaymentMethodsEnum.Cash) {
            prePurchase.gasStation = GasStation.getById(
              data.gasStationId!
            ) as Promise<GasStation>;
            const authorization = new Authorization();
            const savedAuthorization = await em.save(authorization);
            prePurchase.authorization = Promise.resolve(savedAuthorization);
            pubsub.publish(AUTHORIZATION_REQUESTED, {
              authorizationRequested: savedAuthorization
            });
          }
          const savedPurchase = await em.save(prePurchase);

          const subinfo = <GraphQLPartialResolveInfo>(
            getInfoFromSubfield("purchase", info)
          );
          const populatedPurchase = <Purchase>(
            await EntityToGraphResolver.find<Purchase>(
              savedPurchase.id as number,
              Purchase,
              subinfo,
              em
            )
          );

          // Mailer.sendPurchaseReceipt(
          //   (await wallet.fuelType)?.name!,
          //   data.litres,
          //   purchaseTotal,
          //   populatedPurchase.id,
          //   populatedPurchase.stamp,
          //   [(await customer.user)!.username]
          // );

          return resolve({
            purchase: populatedPurchase
          });
        });
      } catch (ex) {
        reject(ex);
      }
    });
  },

  refuel: async (
    data: IRefuelRequest,
    info: GraphQLResolveInfo,
    { user }: { user: IDecodedToken }
  ) => {
    return new Promise<IRefuelResult>(async (resolve, reject) => {
      try {
        await getManager().transaction(async em => {
          //First get customer from security context to find the correct wallet based on fueltypeid
          const pump = <Pump>await Pump.getById(data.pumpId);
          if (!pump) {
            throw "The fuel type doesn´t exist.";
          }
          const gasStation = await pump.gasStation;
          const lastPumpOperation = await getLastPumpOperation(pump.id as number);
          if (!lastPumpOperation) {
            throw "The pump doesn't register last operation";
          }
          const customer = <Customer>await Customer.getByUser(user.id, em);
          const paymentWallet = <Wallet>(
            await Wallet.getByCustomerAndFuelType(customer.id as number, data.fuelTypeId)
          );

          if (!paymentWallet) {
            throw "Customer has no wallet for the given fuel type";
          }

          const paymentFuelType = <FuelType>(
            await FuelType.getById(data.fuelTypeId)
          );

          const paymentFuelPrice = await FuelTypeFunctions.currentPrice(
            paymentFuelType.id as number
          );

          const refuelFuelType = lastPumpOperation.fuelType!;

          const refuelFuelPrice = await FuelTypeFunctions.currentPrice(
            refuelFuelType.id as number
          );

          const paymentLitres =
            (refuelFuelPrice.price / paymentFuelPrice.price) *
            lastPumpOperation?.litres;

          //Check if the wallet have available litres to fullfill the operation
          if (paymentWallet.litres < paymentLitres) {
            throw "Customer wallet don´t have funds.";
          }

          const refuel = new Refuel();
          refuel.created = moment().toDate();
          refuel.stamp = refuel.created;
          refuel.externalId = lastPumpOperation.id.toString();
          refuel.litres = lastPumpOperation.litres;
          refuel.fuelType = Promise.resolve(refuelFuelType);
          refuel.fuelPrice = Promise.resolve(refuelFuelPrice);
          refuel.pump = Promise.resolve(pump);
          refuel.wallet = Promise.resolve(paymentWallet);
          refuel.walletFuelPrice = Promise.resolve(paymentFuelPrice);
          refuel.walletLitres = paymentLitres;

          const authorization = new Authorization();
          if (!gasStation?.purchaseRequireAuthorization) {
            paymentWallet.litres -= paymentLitres;
            await em.save(paymentWallet);
            authorization.status = AuthorizationStatusEnum.Authorized;
          }
          const savedAuthorization = await em.save(authorization);
          refuel.authorization = Promise.resolve(savedAuthorization);

          const savedRefuel = await em.save(refuel);

          //Call to external API to confirm operation
          const isCallExternalConfirmationSuccess = await confirmRefuelOperation(
            pump.externalId,
            lastPumpOperation.id,
            lastPumpOperation.stamp,
            lastPumpOperation.total,
            +savedRefuel.id,
            customer.documentNumber
          );

          if (!isCallExternalConfirmationSuccess) {
            throw ("Calling external API failed");
          }

          const subinfo = <GraphQLPartialResolveInfo>(
            getInfoFromSubfield("refuel", info)
          );
          const populatedRefuel = <Refuel>(
            await EntityToGraphResolver.find<Refuel>(
              savedRefuel.id as number,
              Refuel,
              subinfo,
              em
            )
          );
          pubsub.publish(AUTHORIZATION_REQUESTED, {
            authorizationRequested: savedAuthorization
          });

          Mailer.sendRefuelReceipt(
            paymentFuelType.name,
            lastPumpOperation?.litres,
            refuelFuelType.name,
            paymentLitres,
            paymentLitres * refuelFuelPrice.price,
            savedRefuel.id as number,
            refuel.created,
            [(await customer.user)!.username]
          );

          return resolve({
            refuel: populatedRefuel
          });
        });
      } catch (ex) {
        reject(ex);
      }
    });
  },

  withdrawal: async (
    data: IWithdrawalRequest,
    info: GraphQLResolveInfo,
    { user }: { user: IDecodedToken }
  ) => {
    return new Promise<IWithdrawalResult>(async (resolve, reject) => {
      try {
        await getManager().transaction(async em => {
          const withdrawalMaxAmount = (await Parameter.getByName(ParametersEnum.WithdrawalMaxAmount))!.numberValue;
          const withdrawalAmountMultiple = (await Parameter.getByName(ParametersEnum.WithdrawalAmountMultiple))!.numberValue;
          //First get customer from security context to find the correct wallet based on fueltypeid
          const customer = <Customer>await Customer.getByUser(user.id, em);
          const wallet = <Wallet>(
            await Wallet.getByCustomerAndFuelType(customer.id as number, data.fuelTypeId)
          );

          if (!wallet) {
            throw "Customer has no wallet for the given fuel type";
          }

          const fuelPrice = await FuelTypeFunctions.currentPrice(
            data.fuelTypeId
          );

          const litresEquivalent = data.amount / fuelPrice.price;

          if (wallet.litres < litresEquivalent) {
            throw "Customer wallet litres are insufficient.";
          }

          if (data.amount > withdrawalMaxAmount!) {
            throw "Withdrawal max amount exceeded.";
          }

          if (withdrawalAmountMultiple && (Math.floor(data.amount) % withdrawalAmountMultiple!) !== 0) {
            throw "Incorrect withdrawal amount multiple.";
          }

          const gasStation = <GasStation>(
            await GasStation.getById(data.gasStationId)
          );

          const withdrawal = new CashWithdrawal();
          withdrawal.created = moment().toDate();
          withdrawal.litres = litresEquivalent;
          withdrawal.stamp = withdrawal.created;
          withdrawal.wallet = Promise.resolve(wallet);
          withdrawal.fuelPrice = Promise.resolve(fuelPrice);
          withdrawal.gasStation = Promise.resolve(gasStation);

          const authorization = new Authorization();
          const savedAuthorization = await em.save(authorization);
          withdrawal.authorization = Promise.resolve(savedAuthorization);
          const savedWithdrawal = await em.save(withdrawal);

          const subinfo = <GraphQLPartialResolveInfo>(
            getInfoFromSubfield("withdrawal", info)
          );
          const populatedWithdrawal = <CashWithdrawal>(
            await EntityToGraphResolver.find<CashWithdrawal>(
              savedWithdrawal.id as number,
              CashWithdrawal,
              subinfo,
              em
            )
          );
          pubsub.publish(AUTHORIZATION_REQUESTED, {
            authorizationRequested: savedAuthorization
          });

          // await Mailer.sendWithdrawalReceipt(
          //   data.litres * fuelPrice.price,
          //   (await wallet.fuelType)?.name!,
          //   data.litres,
          //   populatedWithdrawal.id,
          //   populatedWithdrawal.stamp,
          //   [(await customer.user)!.username]
          // );

          return resolve({
            withdrawal: populatedWithdrawal
          });
        });
      } catch (ex) {
        reject(ex);
      }
    });
  },

  transferWithdrawal: async (
    data: ITransferWithdrawalRequest,
    info: GraphQLResolveInfo,
    { user }: { user: IDecodedToken }
  ) => {
    return new Promise<IWithdrawalResult>(async (resolve, reject) => {
      try {
        await getManager().transaction(async em => {
          const withdrawalMaxAmount = (await Parameter.getByName(ParametersEnum.WithdrawalMaxAmount))!.numberValue;
          const withdrawalAmountMultiple = (await Parameter.getByName(ParametersEnum.WithdrawalAmountMultiple))!.numberValue;
          //First get customer from security context to find the correct wallet based on fueltypeid
          const customer = <Customer>await Customer.getByUser(user.id, em);
          const wallet = <Wallet>(
            await Wallet.getByCustomerAndFuelType(customer.id as number, data.fuelTypeId)
          );

          if (!wallet) {
            throw "Customer has no wallet for the given fuel type";
          }

          const fuelPrice = await FuelTypeFunctions.currentPrice(
            data.fuelTypeId
          );

          const litresEquivalent = data.amount / fuelPrice.price;

          if (wallet.litres < litresEquivalent) {
            throw "Customer wallet litres are insufficient.";
          }

          if (data.amount > withdrawalMaxAmount!) {
            throw "Withdrawal max amount exceeded.";
          }

          if (withdrawalAmountMultiple && (Math.floor(data.amount) % withdrawalAmountMultiple!) !== 0) {
            throw "Incorrect withdrawal amount multiple.";
          }

          const withdrawal = new CashWithdrawal();
          withdrawal.created = moment().toDate();
          withdrawal.litres = litresEquivalent;
          withdrawal.stamp = withdrawal.created;
          withdrawal.wallet = Promise.resolve(wallet);
          withdrawal.fuelPrice = Promise.resolve(fuelPrice);
          const savedWithdrawal = await em.save(withdrawal);

          const transfer = new TransferWithdrawal();
          transfer.accountType = data.accountType;
          transfer.withdrawal = Promise.resolve(savedWithdrawal);
          const savedTransfer = await em.save(transfer);

          const subinfo = <GraphQLPartialResolveInfo>(
            getInfoFromSubfield("withdrawal", info)
          );
          const populatedWithdrawal = <CashWithdrawal>(
            await EntityToGraphResolver.find<CashWithdrawal>(
              savedWithdrawal.id as number,
              CashWithdrawal,
              subinfo,
              em
            )
          );

          const notificationEmails = await Parameter.getByName(ParametersEnum.ContactHelpEmails);

          if (!notificationEmails) {
              throw `Parameter ${ParametersEnum.ContactHelpEmails} is not set.`;
          }

          const recipients = notificationEmails.textValue?.split(",");
          if (!recipients) {
              throw `Parameter ${ParametersEnum.ContactHelpEmails} has no recipients values.`;
          }

          await Mailer.sendWithdrawalNotification(
            customer.firstName + " " + customer.lastName,
            data.amount,
            recipients
          );

          pubsub.publish(TRANSFER_WITHDRAWAL_REQUESTED, {
            transferWithdrawalRequested: savedTransfer
          });

          return resolve({
            withdrawal: populatedWithdrawal
          });
        });
      } catch (ex) {
        reject(ex);
      }
    });
  },

  shopPurchase: async (
    data: IShopPurchaseRequest,
    info: GraphQLResolveInfo,
    { user }: { user: IDecodedToken }
  ) => {
    return new Promise<IShopPurchaseResult>(async (resolve, reject) => {
      try {
        await getManager().transaction(async em => {
          const paymentInStoreLimit = (await Parameter.getByName(ParametersEnum.PaymentInStoreLimit))!.numberValue;
          //First get customer from security context to find the correct wallet based on fueltypeid
          const customer = <Customer>await Customer.getByUser(user.id, em);
          const wallet = <Wallet>(
            await Wallet.getByCustomerAndFuelType(customer.id as number, data.fuelTypeId)
          );
          if (!wallet) {
            throw "Customer has no wallet for the given fuel type";
          }

          const fuelPrice = await FuelTypeFunctions.currentPrice(
            data.fuelTypeId
          );

          const litresEquivalent = data.amount / fuelPrice.price;

          if (wallet.litres < litresEquivalent) {
            throw "Customer wallet litres are insufficient.";
          }

          if (data.amount > paymentInStoreLimit!) {
            throw "Payment in store max amount exceeded.";
          }

          const gasStation = <GasStation>(
            await GasStation.getById(data.gasStationId)
          );

          const shopPurchase = new ShopPurchase();
          shopPurchase.created = moment().toDate();
          shopPurchase.litres = litresEquivalent;
          shopPurchase.stamp = shopPurchase.created;
          shopPurchase.wallet = Promise.resolve(wallet);
          shopPurchase.fuelPrice = Promise.resolve(fuelPrice);
          shopPurchase.gasStation = Promise.resolve(gasStation);

          const authorization = new Authorization();

          const savedAuthorization = await em.save(authorization);
          shopPurchase.authorization = Promise.resolve(savedAuthorization);

          const savedShopPurchase = await em.save(shopPurchase);

          const subinfo = <GraphQLPartialResolveInfo>(
            getInfoFromSubfield("shopPurchase", info)
          );

          const populatedShopPurchase = <ShopPurchase>(
            await EntityToGraphResolver.find<ShopPurchase>(
              savedShopPurchase.id as number,
              ShopPurchase,
              subinfo,
              em
            )
          );

          pubsub.publish(AUTHORIZATION_REQUESTED, {
            authorizationRequested: savedAuthorization
          });

          // await Mailer.sendPaymentInStoreReceipt(
          //   (await wallet.fuelType)?.name!,
          //   data.litres,
          //   fuelPrice.price * data.litres,
          //   savedShopPurchase.id,
          //   moment().toDate(),
          //   [(await customer.user)!.username]
          // );

          return resolve({
            shopPurchase: populatedShopPurchase
          });
        });
      } catch (ex) {
        reject(ex);
      }
    });
  },

  exchangeFuel: async (
    data: IExchangeFuelRequest,
    info: GraphQLResolveInfo,
    { user }: { user: IDecodedToken }
  ) => {
    return new Promise<IExchangeFuelResult>(async (resolve, reject) => {
      try {
        await getManager().transaction(async em => {
          const walletLitresLimit = (await Parameter.getByName(ParametersEnum.WalletLitresLimit))!.numberValue;
          const customer = <Customer>await Customer.getByUser(user.id, em);
          const sourceWallet = <Wallet>(
            await Wallet.getByCustomerAndFuelType(
              customer.id as number,
              data.sourceFuelTypeId
            )
          );
          const targetWallet = <Wallet>(
            await Wallet.getByCustomerAndFuelType(
              customer.id as number,
              data.targetFuelTypeId
            )
          );

          if (!(sourceWallet && targetWallet)) {
            throw "Customer has no wallet for one or both of the given fuel types.";
          }

          if (sourceWallet === targetWallet) {
            throw "Customer wallets cannot be the same.";
          }

          if (sourceWallet.litres < data.sourceLitres) {
            throw "Customer wallet litres are insufficient.";
          }

          const sourceWalletFuelType = await sourceWallet.fuelType!;
          const targetWalletFuelType = await targetWallet.fuelType!;

          const sourceWalletFuelPrice = await em
            .createQueryBuilder(FuelPrice, "p")
            .leftJoin("p.fuelType", "t")
            .where("t.id = :fuelTypeId AND p.to is null", {
              fuelTypeId: sourceWalletFuelType.id
            })
            .getOne();

          const targetWalletFuelPrice = await em
            .createQueryBuilder(FuelPrice, "p")
            .leftJoin("p.fuelType", "t")
            .where("t.id = :fuelTypeId AND p.to is null", {
              fuelTypeId: targetWalletFuelType.id
            })
            .getOne();

          if (!(sourceWalletFuelPrice && targetWalletFuelPrice)) {
            throw "There is no fuel price for one or both of the selected fuel types.";
          }

          const targetLitres: number = (data.sourceLitres * sourceWalletFuelPrice.price) / targetWalletFuelPrice.price;

          if ((targetLitres + targetWallet.litres) > walletLitresLimit!) {
            throw "Wallet litre limit exceeded.";
          }

          const exchange = new FuelExchange();
          exchange.created = moment().toDate();
          exchange.stamp = moment().toDate();
          exchange.sourceFuelPrice = Promise.resolve(sourceWalletFuelPrice);
          exchange.targetFuelPrice = Promise.resolve(targetWalletFuelPrice);
          exchange.targetLitres = targetLitres;
          exchange.sourceWallet = Promise.resolve(sourceWallet);
          exchange.targetWallet = Promise.resolve(targetWallet);
          const result = await em.save(exchange);

          sourceWallet.litres -= data.sourceLitres;
          await em.save(sourceWallet);

          targetWallet.litres += targetLitres;
          await em.save(targetWallet);

          Mailer.sendExchangeReceipt(
            (await sourceWallet.fuelType)?.name!,
            data.sourceLitres,
            (await targetWallet.fuelType)?.name!,
            targetLitres,
            result.id as number,
            result.stamp,
            [(await customer.user)!.username]
          );
          return resolve({
            ok: true,
            receiptId: result.id.toString()
          });
        });
      } catch (ex) {
        reject(ex);
      }
    });
  },

  transfer: async (
    data: ITransferRequest,
    info: GraphQLResolveInfo,
    { user }: { user: IDecodedToken }
  ) => {
    return new Promise<ITransferResult>(async (resolve, reject) => {
      try {
        await getManager().transaction(async em => {
          const walletLitresLimit = (await Parameter.getByName(ParametersEnum.WalletLitresLimit))!.numberValue;
          const accountLitresLimit = (await Parameter.getByName(ParametersEnum.AccountLitresLimit))!.numberValue;
          const sourceCustomer = <Customer>await Customer.getByUser(user.id);
          const sourceWallet = <Wallet>(
            await Wallet.getByCustomerAndFuelType(
              sourceCustomer.id as number,
              data.fuelTypeId
            )
          );
          const targetCustomer = <Customer>await Customer.getById(data.targetCustomerId);
          const targetWallet = <Wallet>(
            await Wallet.getByCustomerAndFuelType(
              targetCustomer.id as number,
              data.fuelTypeId
            )
          );

          const targetCustomerWallets = <Wallet[]>await targetCustomer.wallets
          const litresInAccount = targetCustomerWallets.reduce((previous, current) => (current.litres + previous), 0);

          if ((data.targetLitres + litresInAccount) > accountLitresLimit!) {
            throw "Account liter limit exceeded.";
          }
          
          if ((data.targetLitres + targetWallet.litres) > walletLitresLimit!) {
            throw "Wallet liter limit exceeded.";
          }

          const transfer = new Transfer();
          transfer.stamp = moment().toDate();
          transfer.sourceWallet = Promise.resolve(sourceWallet);
          transfer.targetWallet = Promise.resolve(targetWallet);
          transfer.targetLitres = data.targetLitres;
          const savedTransfer = await em.save(transfer);

          sourceWallet.litres -= data.targetLitres;
          await em.save(sourceWallet);
          targetWallet.litres += data.targetLitres;
          await em.save(targetWallet);

          const subinfo = <GraphQLPartialResolveInfo>(
            getInfoFromSubfield("transfer", info)
          );
          const populatedTransfer = <Transfer>(
            await EntityToGraphResolver.find<Transfer>(
              savedTransfer.id as number,
              Transfer,
              subinfo,
              em
            )
          );

          SendFcmToCustomer(+targetCustomer?.id,
            Notifications.TransferRecieved(sourceCustomer.firstName + ' ' + sourceCustomer.lastName, 
            data.targetLitres,
            (await targetWallet.fuelType)!.name),
            em
          );

          return resolve({
            transfer: populatedTransfer
          });
        });
      } catch (ex) {
        reject(ex);
      }
    });
  },

  customerSearch: async (
    search: string,
    info: GraphQLResolveInfo,
    { user }: { user: IDecodedToken }
  ) => {
      try {
        return await getManager().getRepository(Customer)
        .createQueryBuilder("customer")
        .where("customer.document_number = :document", { document: search })
        .getMany();
      } catch (ex) {
        throw(ex);
      }
  },
};
