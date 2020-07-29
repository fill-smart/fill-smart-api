import { Notifications } from "./../firebase/fcm-notifications";
import { getManager } from "typeorm";
import { GraphQLResolveInfo } from "graphql";
import { FuelPrice } from "../database/models/business/fuel-price.model";
import { EntityToGraphResolver } from "../core/entity-resolver";
import {
    ICashWithdrawalPaymentRequestNotification,
    SendFcmToCustomer
} from "../firebase/firebase";

export interface ICashWithdrawalPaymentRequest {
    ammount: number;
    customerId: number;
}

export interface ICashWithdrawalPaymentRequestResult {
    ok: boolean;
}

export interface IShopPurchasePaymentRequest {
    ammount: number;
    customerId: number;
    description: string;
}

export interface IShopPurchasePaymentRequestResult {
    ok: boolean;
}

export const SellerFunctions = {
    requestCashWithdrawalPayment: async (
        data: ICashWithdrawalPaymentRequest
    ): Promise<ICashWithdrawalPaymentRequestResult> => {
        try {
            await SendFcmToCustomer(
                data.customerId,
                Notifications.CashWithdrawalPaymentRequest(data.ammount)
            );
            return {
                ok: true
            };
        } catch (e) {
            throw e;
        }
    },
    requestShopPurchasePayment: async (
        data: IShopPurchasePaymentRequest
    ): Promise<IShopPurchasePaymentRequestResult> => {
        try {
            await SendFcmToCustomer(
                data.customerId,
                Notifications.ShopPurchasePaymentRequest(data.ammount, data.description)
            );
            return {
                ok: true
            };
        } catch (e) {
            throw e;
        }
    }
};
