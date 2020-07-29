import { Notifications } from "./../firebase/fcm-notifications";
import { SendFcmMessageToAll } from "./../firebase/firebase";
import { Notification } from "./../database/models/business/notification.model";
import { Quote } from "../database/models/business/quote.model";
import { EntityToGraphResolver } from "../core/entity-resolver";
import { GraphQLResolveInfo } from "graphql";
import { InvestmentType } from "../database/models/business/investment-type.model";

type PartialNotification = Pick<Notification, "id" | "title" | "text"> &
  Partial<Notification>;

export interface INotificationCreateInput extends PartialNotification { }

export const NotificationFunctions = {
  create: async (
    { ...data }: INotificationCreateInput,
    info: GraphQLResolveInfo
  ) => {
    try {
      const notification = Object.assign(new Notification(), data);
      const { id } = await Notification.create(notification);
      await SendFcmMessageToAll(notification.title, notification.text);
      return await EntityToGraphResolver.find<Notification>(
        id as number,
        Notification,
        info
      );
    } catch (e) {
      console.log(e);
    }
  }
};
