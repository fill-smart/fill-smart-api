import { NotificationTypesEnum } from "./../core/fcm/notification-types.enum";
import { IPushNotification } from "./firebase";

export const Notifications = {
  PurchaseSuccess: (receiptId: string): IPushNotification => ({
    type: NotificationTypesEnum.PurchaseSuccess,
    receiptId
  }),

  PurchaseRejected: (): IPushNotification => ({
    type: NotificationTypesEnum.PurchaseRejected
  }),

  CashWithdrawalPaymentRequest: (ammount: number): IPushNotification => ({
    type: NotificationTypesEnum.CashWithdrawalPaymentRequest,
    ammount
  }),
  ShopPurchasePaymentRequest: (
    ammount: number,
    description: string
  ): IPushNotification => ({
    type: NotificationTypesEnum.ShopPurchasePaymentRequest,
    ammount,
    description
  }),
  TransferRecieved: (
    name: string,
    amount: number,
    wallet: string
  ): IPushNotification => ({
    type: NotificationTypesEnum.TransferRecieved,
    name,
    amount,
    wallet
  }),
  TransferWithdrawalAuthorized: (
    id: number
  ): IPushNotification => ({
    type: NotificationTypesEnum.TransferWithdrawalAuthorized,
    id
  }),
  AuthorizationGranted: (id: number): IPushNotification => ({
    type: NotificationTypesEnum.AuthorizationGranted,
    id
  }),
  AuthorizationRejected: (id: number): IPushNotification => ({
    type: NotificationTypesEnum.AuthorizationRejected,
    id
  }),
  GracePeriodChanged: (): IPushNotification => ({
    type: NotificationTypesEnum.GracePeriodChanged
  }),
  FuelTypeNameChanged: (): IPushNotification => ({
    type: NotificationTypesEnum.FuelTypeNameChanged
  }),
  GlobalMessage: (title: string, text: string): IPushNotification => ({
    type: NotificationTypesEnum.GlobalMessage,
    title,
    text
  })
};
