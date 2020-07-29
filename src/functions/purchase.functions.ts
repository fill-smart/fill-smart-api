import { Notifications } from "./../firebase/fcm-notifications";
import { NotificationTypesEnum } from "./../core/fcm/notification-types.enum";
import { MercadoPago } from "./mercado-pago.functions";
import {
    Purchase,
    PurchaseStatusEnum
} from "./../database/models/business/purchase.model";
import { getManager } from "typeorm";
import { WalletFunctions } from "./wallet.functions";
import { SendFcmToUser } from "../firebase/firebase";
import Mailer from "../core/mailing/mailer";

export interface IMercadoPagoPaymentNews {
    paymentId: number;
    purchaseId: number;
}

export const PurchaseFunctions = {
    updateMP: async (data: IMercadoPagoPaymentNews) => {
        try {
            await getManager().transaction(async em => {
                const payment = await MercadoPago.Payment.getById(
                    data.paymentId
                );
                const purchase = <Purchase>(
                    await Purchase.getById(data.purchaseId)
                );
                if (
                    payment.status === "approved" &&
                    purchase.status === PurchaseStatusEnum.Pending
                ) {
                    purchase.mpPaymentId = payment.id;
                    purchase.mpFeeAmount = payment.fee_details.reduce(
                        (p, n) => p + n.amount,
                        0
                    );
                    purchase.mpNetReceivedAmount =
                        payment.transaction_details.net_received_amount;
                    purchase.mpOperationType = payment.operation_type;
                    purchase.mpPaymentMethodId = payment.payment_method_id;
                    purchase.mpStatus = payment.status;
                    purchase.mpStatusDetail = payment.status_detail;
                    purchase.mpTransactionAmount = payment.transaction_amount;
                    purchase.status = PurchaseStatusEnum.Completed;
                    purchase.mpPaymentTypeId = payment.payment_type_id;
                    purchase.mpPaymentData = JSON.stringify(payment);
                    const walletId = <number>(await purchase.wallet)?.id;
                    const litres = purchase.litres;
                    await WalletFunctions.addFuelToWallet({
                        walletId,
                        litres,
                        em
                    });
                    await em.save(purchase);
                    const wallet = await purchase.wallet!;
                    const customer = await wallet.customer!;
                    const user = await customer.user!;
                    await SendFcmToUser(
                        user.id as number,
                        Notifications.PurchaseSuccess(
                            "0001-" + payment.id.toString().padStart(10, "0")
                        )
                    );

                    Mailer.sendPurchaseReceipt(
                        (await wallet.fuelType)?.name!,
                        purchase.litres,
                        purchase.litres * (await purchase.fuelPrice)?.price!,
                        purchase.id as number,
                        purchase.stamp,
                        [(await (await wallet.customer)?.user)?.username!]
                    );
                } else if (
                    payment.status === "cancelled" &&
                    purchase.status === PurchaseStatusEnum.Pending
                ) {
                    purchase.status = PurchaseStatusEnum.Canceled;
                    purchase.mpPaymentData = JSON.stringify(payment);
                    await em.save(purchase);
                } else if (
                    payment.status === "charged_back" &&
                    purchase.status === PurchaseStatusEnum.Completed
                ) {
                    purchase.status = PurchaseStatusEnum.ChargedBack;
                    purchase.mpChargedBackPaymentData = JSON.stringify(payment);
                    await em.save(purchase);
                }
            });
        } catch (ex) {
            console.log(ex);
        }
    }
};
