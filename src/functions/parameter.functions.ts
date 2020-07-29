import { SendFcmToAll } from "./../firebase/firebase";
import { Notifications } from "./../firebase/fcm-notifications";
import { getManager } from "typeorm";
import {
  Parameter,
  ParametersEnum,
} from "./../core/models/system/parameter.model";

export const ParameterFunctions = {
  setGracePeriod: async (value: number) => {
    try {
      let gracePeriod: Parameter | undefined;
      gracePeriod = await Parameter.getByName(ParametersEnum.GracePeriod);
      if (!gracePeriod) {
        gracePeriod = new Parameter();
        gracePeriod.name = ParametersEnum.GracePeriod;
      }
      gracePeriod.numberValue = value;
      await getManager().save(gracePeriod);
      await SendFcmToAll(Notifications.GracePeriodChanged());
      return { success: true };
    } catch (e) {
      console.log(e);
    }
  },
  setExchangeGracePeriod: async (value: number) => {
    try {
      let exchangeGracePeriod: Parameter | undefined;
      exchangeGracePeriod = await Parameter.getByName(
        ParametersEnum.ExchangeGracePeriod
      );
      if (!exchangeGracePeriod) {
        exchangeGracePeriod = new Parameter();
        exchangeGracePeriod.name = ParametersEnum.GracePeriod;
      }
      exchangeGracePeriod.numberValue = value;
      await getManager().save(exchangeGracePeriod);
      await SendFcmToAll(Notifications.GracePeriodChanged());
      return { success: true };
    } catch (e) {
      console.log(e);
    }
  },
  setPurchaseMaxLitres: async (value: number) => {
    try {
      let purchaseMaxLitres: Parameter | undefined;
      purchaseMaxLitres = await Parameter.getByName(
        ParametersEnum.PurchaseMaxLitres
      );
      if (!purchaseMaxLitres) {
        purchaseMaxLitres = new Parameter();
        purchaseMaxLitres.name = ParametersEnum.PurchaseMaxLitres;
      }
      purchaseMaxLitres.numberValue = value;
      await getManager().save(purchaseMaxLitres);
      return { success: true };
    } catch (e) {
      console.log(e);
    }
  },
  setWithdrawalMaxAmount: async (value: number) => {
    try {
      let withdrawalMaxAmount: Parameter | undefined;
      withdrawalMaxAmount = await Parameter.getByName(
        ParametersEnum.WithdrawalMaxAmount
      );
      if (!withdrawalMaxAmount) {
        withdrawalMaxAmount = new Parameter();
        withdrawalMaxAmount.name = ParametersEnum.WithdrawalMaxAmount;
      }
      withdrawalMaxAmount.numberValue = value;
      await getManager().save(withdrawalMaxAmount);
      return { success: true };
    } catch (e) {
      console.log(e);
    }
  },
  setWithdrawalAmountMultiple: async (value: number) => {
    try {
      let withdrawalAmountMultiple: Parameter | undefined;
      withdrawalAmountMultiple = await Parameter.getByName(
        ParametersEnum.WithdrawalAmountMultiple
      );
      if (!withdrawalAmountMultiple) {
        withdrawalAmountMultiple = new Parameter();
        withdrawalAmountMultiple.name = ParametersEnum.WithdrawalAmountMultiple;
      }
      withdrawalAmountMultiple.numberValue = value;
      await getManager().save(withdrawalAmountMultiple);
      return { success: true };
    } catch (e) {
      console.log(e);
    }
  },
  setPaymentInStoreLimit: async (value: number) => {
    try {
      let paymentInStoreLimit: Parameter | undefined;
      paymentInStoreLimit = await Parameter.getByName(
        ParametersEnum.PaymentInStoreLimit
      );
      if (!paymentInStoreLimit) {
        paymentInStoreLimit = new Parameter();
        paymentInStoreLimit.name = ParametersEnum.PaymentInStoreLimit;
      }
      paymentInStoreLimit.numberValue = value;
      await getManager().save(paymentInStoreLimit);
      return { success: true };
    } catch (e) {
      console.log(e);
    }
  },
  setContactHelpEmails: async (value: string) => {
    try {
      let contactHelpEmails: Parameter | undefined;
      contactHelpEmails = await Parameter.getByName(
        ParametersEnum.ContactHelpEmails
      );
      if (!contactHelpEmails) {
        contactHelpEmails = new Parameter();
        contactHelpEmails.name = ParametersEnum.ContactHelpEmails;
      }
      contactHelpEmails.textValue = value;
      await getManager().save(contactHelpEmails);
      return { success: true };
    } catch (e) {
      console.log(e);
    }
  },
  setWithdrawalNotificationEmails: async (value: string) => {
    try {
      let withdrawalNotificationEmails: Parameter | undefined;
      withdrawalNotificationEmails = await Parameter.getByName(
        ParametersEnum.WithdrawalNotificationEmails
      );
      if (!withdrawalNotificationEmails) {
        withdrawalNotificationEmails = new Parameter();
        withdrawalNotificationEmails.name = ParametersEnum.WithdrawalNotificationEmails;
      }
      withdrawalNotificationEmails.textValue = value;
      await getManager().save(withdrawalNotificationEmails);
      return { success: true };
    } catch (e) {
      console.log(e);
    }
  },
  setAccountLitresLimit: async (value: number) => {
    try {
      let accountLitresLimit: Parameter | undefined;
      accountLitresLimit = await Parameter.getByName(
        ParametersEnum.AccountLitresLimit
      );
      if (!accountLitresLimit) {
        accountLitresLimit = new Parameter();
        accountLitresLimit.name = ParametersEnum.AccountLitresLimit;
      }
      accountLitresLimit.numberValue = value;
      await getManager().save(accountLitresLimit);
      return { success: true };
    } catch (e) {
      console.log(e);
    }
  },
  setWalletLitresLimit: async (value: number) => {
    try {
      let walletLitresLimit: Parameter | undefined;
      walletLitresLimit = await Parameter.getByName(
        ParametersEnum.WalletLitresLimit
      );
      if (!walletLitresLimit) {
        walletLitresLimit = new Parameter();
        walletLitresLimit.name = ParametersEnum.WalletLitresLimit;
      }
      walletLitresLimit.numberValue = value;
      await getManager().save(walletLitresLimit);
      return { success: true };
    } catch (e) {
      console.log(e);
    }
  },
};
