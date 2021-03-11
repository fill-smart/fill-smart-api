import { getCurrentEnvironmentalConfig } from "../core/env/env";
const mercadopago = require("mercadopago");
export type PreferenceItem = {
    title: string;
    description: string;
    quantity: number;
    currency_id: "ARS";
    unit_price: number;
};

export type PreferenceInput = {
    items: PreferenceItem[];
    payer: {
        email: string;
    };
    expires: boolean;
    expiration_date_from: string;
    expiration_date_to: string;
    external_reference: string;
    notification_url: string;
};

export type Preference = {
    id: string;
    init_point: string;
};

export type Payment = {
    id: number;
    operation_type: string;
    payment_method_id: string;
    payment_type_id: string;
    transaction_amount: number;
    transaction_details: {
        net_received_amount: number;
    };
    fee_details: {
        amount: number;
    }[];
    status:
        | "pending"
        | "approved"
        | "authorized"
        | "in_process"
        | "in_mediation"
        | "rejected"
        | "cancelled"
        | "refunded"
        | "charged_back";
    status_detail: string;
};

export const MercadoPago = {
    Preference: {
        create: (data: PreferenceInput): Promise<Preference> => {
            return new Promise<Preference>((resolve, reject) => {
                mercadopago.preferences.create(
                    data,
                    undefined,
                    (err: any, response: any) => {
                        if (err) return reject(err);
                        return resolve(response.body);
                    }
                );
            });
        }
    },
    Initialize: async (): Promise<void> => {
        const config = await getCurrentEnvironmentalConfig();
        mercadopago.configure({
            access_token: config.mercadoPagoSecret
        });
    },
    Payment: {
        getById: (id: number): Promise<Payment> => {
            return new Promise<Payment>((resolve, reject) => {
                mercadopago.payment.get(
                    id,
                    undefined,
                    (err: any, response: any) => {
                        if (err) return reject(err);
                        return resolve(response.body);
                    }
                );
            });
        }
    }
};
