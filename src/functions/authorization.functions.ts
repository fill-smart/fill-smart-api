import { pubsub, AUTHORIZATION_REQUESTED } from "./../gql/resolvers";
import {
  Purchase,
  PurchaseStatusEnum,
} from "./../database/models/business/purchase.model";
import { getManager } from "typeorm";
import {
  Authorization,
  AuthorizationStatusEnum,
} from "./../database/models/business/authorization.model";
import { Notifications } from "./../firebase/fcm-notifications";
import { SendFcmToCustomer } from "./../firebase/firebase";
import { WalletFunctions } from "./wallet.functions";
import Mailer from "../core/mailing/mailer";

interface IAuthorizationGenericResult {
  ok: boolean;
}

export const AuthorizationFunctions = {
  grantAuthorization: async (
    id: number
  ): Promise<IAuthorizationGenericResult> => {
    return new Promise(async (resolve, reject) => {
      await getManager().transaction(async (em) => {
        const authorization = <Authorization>await Authorization.getById(id);
        const refuel = await authorization.refuel;
        const cashWithdrawal = await authorization.cashWithdrawal;
        const shopPurchase = await authorization.shopPurchase;
        const purchase = await authorization.purchase;
        let operationOk: boolean = false;
        if (refuel) {
          //Es Refuel
          const wallet = await refuel.wallet!;
          const availableLitres = await WalletFunctions.availableLitres(
            wallet.id as number
          );
          if (availableLitres >= refuel.walletLitres) {
            wallet.litres -= refuel.walletLitres;
            await em.save(wallet);
            authorization.status = AuthorizationStatusEnum.Authorized;
            await em.save(authorization);
            await SendFcmToCustomer(
              (await wallet.customer)!.id as number,
              Notifications.AuthorizationGranted(authorization.id as number)
            );
            operationOk = true;
          }
        }
        if (cashWithdrawal) {
          const wallet = await cashWithdrawal.wallet!;
          const availableLitres = await WalletFunctions.availableLitres(
            wallet.id as number
          );
          if (availableLitres >= cashWithdrawal.litres) {
            wallet.litres -= cashWithdrawal.litres;
            await em.save(wallet);
            authorization.status = AuthorizationStatusEnum.Authorized;
            await em.save(authorization);
            await SendFcmToCustomer(
              (await wallet.customer)!.id as number,
              Notifications.AuthorizationGranted(authorization.id as number)
            );

            Mailer.sendWithdrawalReceipt(
              cashWithdrawal.litres *
                (await await cashWithdrawal.fuelPrice)?.price!,
              (await wallet.fuelType)?.name!,
              cashWithdrawal.litres,
              cashWithdrawal.id as number,
              cashWithdrawal.stamp,
              [(await (await wallet.customer)?.user)?.username!]
            );

            operationOk = true;
          }
        }
        if (shopPurchase) {
          const wallet = await shopPurchase.wallet!;
          const availableLitres = await WalletFunctions.availableLitres(
            wallet.id as number
          );
          if (availableLitres >= shopPurchase.litres) {
            wallet.litres -= shopPurchase.litres;
            em.save(wallet);
            authorization.status = AuthorizationStatusEnum.Authorized;
            await em.save(authorization);
            await SendFcmToCustomer(
              (await wallet.customer)!.id as number,
              Notifications.AuthorizationGranted(authorization.id as number)
            );

            await Mailer.sendPaymentInStoreReceipt(
              (await wallet.fuelType)?.name!,
              shopPurchase.litres,
              shopPurchase.litres * (await shopPurchase.fuelPrice)?.price!,
              shopPurchase.id as number,
              shopPurchase.stamp,
              [(await (await wallet.customer)?.user)?.username!]
            );

            operationOk = true;
          }
        }
        //cash fuel purchase
        if (purchase) {
          const wallet = await purchase.wallet!;
          wallet.litres += purchase.litres;
          purchase.status = PurchaseStatusEnum.Completed;
          await em.save(purchase);
          await em.save(wallet);
          authorization.status = AuthorizationStatusEnum.Authorized;
          await em.save(authorization);
          await SendFcmToCustomer(
            (await wallet.customer)!.id as number,
            Notifications.AuthorizationGranted(authorization.id as number)
          );

          Mailer.sendPurchaseReceipt(
            (await wallet.fuelType)?.name!,
            purchase.litres,
            purchase.litres * (await purchase.fuelPrice)?.price!,
            purchase.id as number,
            purchase.stamp,
            [(await (await wallet.customer)?.user)?.username!]
          );

          operationOk = true;
        }
        pubsub.publish(AUTHORIZATION_REQUESTED, {
          authorizationRequested: authorization,
        });
        resolve({ ok: operationOk });
      });
    });
  },
  rejectAuthorization: async (
    id: number
  ): Promise<IAuthorizationGenericResult> => {
    return new Promise(async (resolve, reject) => {
      await getManager().transaction(async (em) => {
        const authorization = <Authorization>await Authorization.getById(id);
        const refuel = await authorization.refuel;
        const cashWithdrawal = await authorization.cashWithdrawal;
        const shopPurchase = await authorization.shopPurchase;
        const purchase = await authorization.purchase;
        if (refuel) {
          const wallet = await refuel.wallet!;
          authorization.status = AuthorizationStatusEnum.Rejected;
          await em.save(authorization);
          SendFcmToCustomer(
            (await wallet.customer)!.id as number,
            Notifications.AuthorizationRejected(authorization.id as number)
          );
        }
        if (cashWithdrawal) {
          const wallet = await cashWithdrawal.wallet!;
          authorization.status = AuthorizationStatusEnum.Rejected;
          await em.save(authorization);
          SendFcmToCustomer(
            (await wallet.customer)!.id as number,
            Notifications.AuthorizationRejected(authorization.id as number)
          );
        }
        if (shopPurchase) {
          const wallet = await shopPurchase.wallet!;
          authorization.status = AuthorizationStatusEnum.Rejected;
          await em.save(authorization);
          SendFcmToCustomer(
            (await wallet.customer)!.id as number,
            Notifications.AuthorizationRejected(authorization.id as number)
          );
        }
        if (purchase) {
          const wallet = await purchase.wallet!;
          authorization.status = AuthorizationStatusEnum.Rejected;
          purchase.status = PurchaseStatusEnum.Canceled;
          await em.save(purchase);
          await em.save(authorization);
          SendFcmToCustomer(
            (await wallet.customer)!.id as number,
            Notifications.AuthorizationRejected(authorization.id as number)
          );
        }
        pubsub.publish(AUTHORIZATION_REQUESTED, {
          authorizationRequested: authorization,
        });
        resolve({ ok: true });
      });
    });
  },
};
