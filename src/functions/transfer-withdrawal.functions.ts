import { pubsub, AUTHORIZATION_REQUESTED, TRANSFER_WITHDRAWAL_REQUESTED } from "../gql/resolvers";
import {
  Purchase,
  PurchaseStatusEnum,
} from "../database/models/business/purchase.model";
import { getManager } from "typeorm";
import {
  Authorization,
  AuthorizationStatusEnum,
} from "../database/models/business/authorization.model";
import { Notifications } from "../firebase/fcm-notifications";
import { SendFcmToCustomer } from "../firebase/firebase";
import { WalletFunctions } from "./wallet.functions";
import Mailer from "../core/mailing/mailer";
import { TransferWithdrawal } from "../database/models/business/transfer-withdrawal.model";
import moment from "moment";
import { User } from "../database/models/business/user.model";


interface IGenericResult {
  ok: boolean;
}

export const TransferWithdrawalFunctions = {
  acceptTransferWithdrawal: async (
    id: number,
    code: string,
    userId: number,
  ): Promise<IGenericResult> => {
    return new Promise(async (resolve, reject) => {
      await getManager().transaction(async (em) => {
        let operationOk: boolean = false;
        const transfer = <TransferWithdrawal>await TransferWithdrawal.getById(id);
        const withdrawal = await transfer.withdrawal!;
        const wallet = await withdrawal.wallet!;
        const availableLitres = await WalletFunctions.availableLitres(wallet!.id as number);

        if (availableLitres >= withdrawal.litres) {
          wallet.litres -= withdrawal.litres;
          await em.save(wallet);
          transfer.authorizer = <Promise<User>>User.getById(userId, em);
          transfer.authorized = true;
          transfer.stamp = moment().toDate();
          transfer.code = code;
          const savedTransfer = await em.save(transfer);

          pubsub.publish(TRANSFER_WITHDRAWAL_REQUESTED, {
            transferWithdrawalRequested: savedTransfer
          });

          await SendFcmToCustomer(
            (await wallet.customer)!.id as number,
            Notifications.TransferWithdrawalAuthorized(savedTransfer.id as number)
          );

          operationOk = true;
          resolve({ ok: operationOk });
        } else {
          reject();
        }
      });
    });
  },
  rejectTransferWithdrawal: async (
    id: number,
    userId: number,
  ): Promise<IGenericResult> => {
    return new Promise(async (resolve, reject) => {
      await getManager().transaction(async (em) => {
        const transfer = <TransferWithdrawal>await TransferWithdrawal.getById(id);
        const withdrawal = await transfer.withdrawal!;
        transfer.authorizer = <Promise<User>>User.getById(userId, em);
        transfer.authorized = false;
        transfer.stamp = moment().toDate();
        const savedTransfer = await em.save(transfer);
        
        pubsub.publish(TRANSFER_WITHDRAWAL_REQUESTED, {
          transferWithdrawalRequested: savedTransfer
        });
        resolve({ ok: true });
      });
    });
  },
};
