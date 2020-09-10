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
import { TransferWithdrawalAttachment } from "../database/models/business/transfer-withdrawal-attachment.model";
import { mkdirSync, createWriteStream } from "fs";
import fs from "fs";
import { GraphQLUpload } from 'apollo-server-express';
import { Stream } from "stream";
import * as Path from "path";

interface IGenericResult {
  ok: boolean;
}

export type ApolloUploadedFile = Promise<{
  createReadStream: () => Stream;
  filename: string;
  mimetype: string;
  encoding: string;
}>;

export const TransferWithdrawalFunctions = {
  acceptTransferWithdrawal: async (
    id: number,
    code: string,
    userId: number,
    fileList: ApolloUploadedFile[]
  ): Promise<IGenericResult> => {
    return new Promise(async (resolve, reject) => {
      await getManager().transaction(async (em) => {
        let operationOk: boolean = false;

        const transfer = <TransferWithdrawal>await TransferWithdrawal.getById(id);
        const withdrawal = await transfer.withdrawal!;
        const wallet = await withdrawal.wallet!;
        const availableLitres = await WalletFunctions.availableLitres(wallet!.id as number);

        const uploadDir = Path.join(__dirname, "../../.uploads/");
        const storeFS = async (file: ApolloUploadedFile, filename: string, path: string) => {
          const pathWhitName = `${path}${filename}`;
          const { createReadStream } = await file;
          createReadStream()
            .pipe(fs.createWriteStream(pathWhitName))
        }
        let fileName: string;
        for (let iFile of fileList) {
          fileName = `${id}-${(await iFile).filename}`
          await storeFS(iFile, fileName, uploadDir);
          const imageFile = Object.assign(new TransferWithdrawalAttachment(), { filename: (await iFile).filename, encoding: (await iFile).encoding, mimetype: (await iFile).mimetype, path: uploadDir, TransferWithdrawal: Promise.resolve(transfer) });
          await em.save(imageFile);
        }

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
