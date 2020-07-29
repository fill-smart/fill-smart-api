import { NotificationTypesEnum } from "./../core/fcm/notification-types.enum";
import { Customer } from "./../database/models/business/customer.model";
import {
  FcmToken,
  FcmTokenStatusEnum,
} from "./../database/models/business/fcm-token.model";
import { getManager, EntityManager } from "typeorm";
import * as firebaseAdmin from "firebase-admin";

const isProduction = process.env.NODE_ENV === "prod";
const firebaseConfigPath = `${__dirname}/../../firebase-config${
  !isProduction ? ".development" : ""
}.json`;
const key = require(firebaseConfigPath);
const databaseUrl: string = isProduction
  ? "https://fillsmart.firebaseio.com"
  : "https://fillsmart-development.firebaseio.com";
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(key),
  databaseURL: databaseUrl,
});

export interface IPushNotification {
  type: NotificationTypesEnum;
  [key: string]: any;
}

export interface ICashWithdrawalPaymentRequestNotification
  extends IPushNotification {
  ammount: number;
}

export const encodePushNotificationPayload = (payload: IPushNotification) => {
  return {
    //Needed for data only notifications in IOS
    data: {
      payload: JSON.stringify(payload),
    },
  };
};

export const SendFcmToUser = async (
  userId: number,
  message: IPushNotification
) => {
  const active = FcmTokenStatusEnum.Active;
  const em = getManager();
  const tokens = await em
    .createQueryBuilder(FcmToken, "t")
    .leftJoin("t.user", "u")
    .where("u.id = :userId", { userId })
    .andWhere("t.status = :active", { active })
    .getMany();
  tokens.map(async (fcmToken) => {
    try {
      const result = await firebaseAdmin
        .messaging()
        .sendToDevice(fcmToken.token, encodePushNotificationPayload(message), {
          contentAvailable: true,
        });
      if (result.failureCount > 0) {
        fcmToken.status = FcmTokenStatusEnum.Inactive;
        await em.save(fcmToken);
      }
    } catch (e) {
      console.log(e);
    }
  });
};

export const SendFcmToCustomer = async (
  customerId: number,
  message: IPushNotification,
  em?: EntityManager
) => {
  const manager = em ?? getManager();
  const { userId }: { userId: number } = await manager
    .createQueryBuilder(Customer, "c")
    .leftJoin("c.user", "u")
    .select("u.id", "userId")
    .where("c.id = :customerId", { customerId })
    .getRawOne();
  return await SendFcmToUser(userId, message);
};

export const SendFcmToAll = async (message: IPushNotification) => {
  const active = FcmTokenStatusEnum.Active;
  const em = getManager();
  const tokens = await em
    .createQueryBuilder(FcmToken, "t")
    .where("t.status = :active", { active })
    .getMany();
  tokens.map(async (fcmToken) => {
    try {
      const result = await firebaseAdmin
        .messaging()
        .sendToDevice(fcmToken.token, encodePushNotificationPayload(message), {
          contentAvailable: true,
          priority: "high",
        });
      if (result.failureCount > 0) {
        fcmToken.status = FcmTokenStatusEnum.Inactive;
        await em.save(fcmToken);
      }
    } catch (e) {
      console.log(e);
    }
  });
};

export const SendFcmMessageToAll = async (title: string, message: string) => {
  const active = FcmTokenStatusEnum.Active;
  const em = getManager();
  const tokens = await em
    .createQueryBuilder(FcmToken, "t")
    .where("t.status = :active", { active })
    .getMany();
  tokens.map(async (fcmToken) => {
    try {
      const result = await firebaseAdmin.messaging().sendToDevice(
        fcmToken.token,
        { notification: { title: title, body: message } },
        {
          contentAvailable: true,
          priority: "high",
        }
      );
      if (result.failureCount > 0) {
        fcmToken.status = FcmTokenStatusEnum.Inactive;
        await em.save(fcmToken);
      }
    } catch (e) {
      console.log(e);
    }
  });
};
