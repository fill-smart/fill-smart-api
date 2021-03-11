import { ViewColumn, ViewEntity } from "typeorm";
import { PaymentMethodsEnum, PurchaseStatusEnum } from "../../models/business/purchase.model";
import { BaseModel } from "./../../../core/models/base.model";

@ViewEntity({
  expression: `
  SELECT CONCAT('R',refuel.id) id,refuel.created,refuel.updated,refuel.deleted,refuel.stamp, fuel_type.id AS fuel_type_id, fuel_type.name AS fuel_type_name, gas_station.id AS gas_station_id,gas_station.name AS gas_station_name, customer.first_name AS customer_first_name,customer.last_name AS customer_last_name,customer.document_number AS customer_document_number, fuel_price.price AS fuel_price, refuel.litres, 1 AS operation_type_id, 'Retiro de Combustible' AS operation_type_name, pump.external_id AS pump_external_id, authorization.status AS authorization_status, NULL AS exchange_source_fuel_type, user.id AS user_id, NULL AS payment_method, 
  refuel.litres * fuel_price.price AS total,
  NULL AS target_customer_first_name,
  NULL AS target_customer_last_name,
  NULL AS target_customer_document_number,
  NULL AS target_user_id,
  NULL AS transfer_withdrawal_id,
  NULL AS transfer_withdrawal_authorized,
  NULL AS purchase_status,
  NULL AS mp_payment_id,
  NULL AS mp_payment_method_id,
  CONCAT(LPAD(pump_id, 4, '0'), '-', LPAD(refuel.id, 8, '0')) AS transaction_id
    FROM refuel refuel
    LEFT JOIN wallet wallet ON refuel.wallet_id = wallet.id
    LEFT JOIN customer customer ON wallet.customer_id = customer.id
    LEFT JOIN fuel_price fuel_price ON refuel.fuel_price_id = fuel_price.id
    LEFT JOIN fuel_type fuel_type ON fuel_price.fuel_type_id = fuel_type.id
    LEFT JOIN pump pump ON refuel.pump_id = pump.id
    LEFT JOIN gas_station gas_station ON pump.gas_station_id = gas_station.id
    LEFT JOIN authorization authorization ON refuel.authorization_id = authorization.id
    LEFT JOIN user user ON customer.user_id = user.id
  UNION
  SELECT CONCAT('SP',shop_purchase.id) id,shop_purchase.created,shop_purchase.updated,shop_purchase.deleted,shop_purchase.stamp,fuel_type.id AS fuel_type_id, fuel_type.name AS fuel_type_name,gas_station.id AS gas_station_id, gas_station.name AS gas_station_name, customer.first_name AS customer_first_name,customer.last_name AS customer_last_name,customer.document_number AS customer_document_number, fuel_price.price AS fuelPrice, shop_purchase.litres, 3 AS operation_type_id, 'Compra en Shop' AS operation_type_name, NULL AS pump_external_id, authorization.status AS authorization_status, NULL AS exchange_source_fuel_type, user.id AS user_id, NULL AS payment_method,
  shop_purchase.litres * fuel_price.price AS total,
  NULL AS target_customer_first_name,
  NULL AS target_customer_last_name,
  NULL AS target_customer_document_number,
  NULL AS target_user_id,
  NULL AS transfer_withdrawal_id,
  NULL AS transfer_withdrawal_authorized,
  NULL AS purchase_status,
  NULL AS mp_payment_id,
  NULL AS mp_payment_method_id,
  LPAD(shop_purchase.id, 8, '0') AS transaction_id
    FROM shop_purchase shop_purchase
    LEFT JOIN wallet wallet ON shop_purchase.wallet_id = wallet.id
    LEFT JOIN customer customer ON wallet.customer_id = customer.id
    LEFT JOIN fuel_price fuel_price ON shop_purchase.fuel_price_id = fuel_price.id
    LEFT JOIN fuel_type fuel_type ON wallet.fuel_type_id = fuel_type.id
    LEFT JOIN gas_station gas_station ON shop_purchase.gas_station_id = gas_station.id
    LEFT JOIN authorization authorization ON shop_purchase.authorization_id = authorization.id
    LEFT JOIN user user ON customer.user_id = user.id
  UNION
  SELECT CONCAT('CW',cash_withdrawal.id) id,cash_withdrawal.created,cash_withdrawal.updated,cash_withdrawal.deleted,cash_withdrawal.stamp, fuel_type.id AS fuel_type_id,fuel_type.name AS fuel_type_name, gas_station.id AS gas_station_id, gas_station.name AS gas_station_name, customer.first_name AS customer_first_name,customer.last_name AS customer_last_name,customer.document_number AS customer_document_number, fuel_price.price AS fuel_price, cash_withdrawal.litres, 4 AS operation_type_id, 'Retiro de Fondos' AS operation_type_name, NULL AS pump_external_id, authorization.status AS authorization_status, NULL AS exchange_source_fuel_type, user.id AS user_id, NULL AS payment_method,
  cash_withdrawal.litres * fuel_price.price AS total,
  NULL AS target_customer_first_name,
  NULL AS target_customer_last_name,
  NULL AS target_customer_document_number,
  NULL AS target_user_id,
  transfer_withdrawal.id AS transfer_withdrawal_id,
  transfer_withdrawal.authorized AS transfer_withdrawal_authorized,
  NULL AS purchase_status,
  NULL AS mp_payment_id,
  NULL AS mp_payment_method_id,
  LPAD(cash_withdrawal.id, 8, '0') AS transaction_id
    FROM cash_withdrawal cash_withdrawal
    LEFT JOIN wallet wallet ON cash_withdrawal.wallet_id = wallet.id
    LEFT JOIN customer customer ON wallet.customer_id = customer.id
    LEFT JOIN fuel_price fuel_price ON cash_withdrawal.fuel_price_id = fuel_price.id
    LEFT JOIN fuel_type fuel_type ON wallet.fuel_type_id = fuel_type.id
    LEFT JOIN gas_station gas_station ON cash_withdrawal.gas_station_id = gas_station.id
    LEFT JOIN authorization authorization ON cash_withdrawal.authorization_id = authorization.id
    LEFT JOIN user user ON customer.user_id = user.id
    LEFT JOIN transfer_withdrawal transfer_withdrawal ON transfer_withdrawal.withdrawal_id = cash_withdrawal.id 
  UNION
  SELECT CONCAT('P',purchase.id) id,purchase.created,purchase.updated,purchase.deleted,purchase.stamp, fuel_type.id AS fuel_type_id,fuel_type.name AS fuel_type_name, gas_station.id AS gas_station_id, gas_station.name AS gas_station_name, customer.first_name AS customer_first_name,customer.last_name AS customer_last_name,customer.document_number AS customer_document_number, fuel_price.price AS fuel_price, purchase.litres, 2 AS operation_type_id, 'Compra de Combustible' AS operation_type_name, NULL AS pump_external_id, authorization.status AS authorization_status, NULL AS exchange_source_fuel_type, user.id AS user_id, payment_method AS payment_method,
  purchase.litres * fuel_price.price AS total,
  NULL AS target_customer_first_name,
  NULL AS target_customer_last_name,
  NULL AS target_customer_document_number,
  NULL AS target_user_id,
  NULL AS transfer_withdrawal_id,
  NULL AS transfer_withdrawal_authorized,
  purchase.status AS purchase_status,
  purchase.mp_payment_id AS mp_payment_id,
  purchase.mp_payment_method_id AS mp_payment_method_id, 
  LPAD(purchase.id, 8, '0') AS transaction_id
    FROM purchase purchase
    LEFT JOIN wallet wallet ON purchase.wallet_id = wallet.id
    LEFT JOIN customer customer ON wallet.customer_id = customer.id
    LEFT JOIN fuel_price fuel_price ON purchase.fuel_price_id = fuel_price.id
    LEFT JOIN fuel_type fuel_type ON wallet.fuel_type_id = fuel_type.id
    LEFT JOIN gas_station gas_station ON purchase.gas_station_id = gas_station.id
    LEFT JOIN authorization authorization ON purchase.authorization_id = authorization.id
    LEFT JOIN user user ON customer.user_id = user.id
  UNION
  SELECT  CONCAT('E',fuel_exchange.id) id, fuel_exchange.created, fuel_exchange.updated, fuel_exchange.deleted, fuel_exchange.stamp, fuel_type.id AS fuel_type_id, fuel_type.name AS fuel_type_name, NULL AS gas_station_id, NULL AS gas_station_name, customer.first_name AS customer_first_name, customer.last_name AS customer_last_name, customer.document_number AS customer_document_number, fuel_price.price AS fuel_price, fuel_exchange.target_litres AS litres, 5 AS operation_type_id, 'Canje de Combustible' AS operation_type_name, NULL AS pump_external_id, NULL AS authorization_status, source_fuel_type.name AS exchange_source_fuel_type, user.id AS user_id, NULL AS payment_method,
  fuel_exchange.target_litres * fuel_price.price AS total,
  NULL AS target_customer_first_name,
  NULL AS target_customer_last_name,
  NULL AS target_customer_document_number,
  NULL AS target_user_id,
  NULL AS transfer_withdrawal_id,
  NULL AS transfer_withdrawal_authorized,
  NULL AS purchase_status,
  NULL AS mp_payment_id,
  NULL AS mp_payment_method_id,
  LPAD(fuel_exchange.id, 8, '0') AS transaction_id
    FROM fuel_exchange fuel_exchange
    LEFT JOIN wallet wallet ON fuel_exchange.target_wallet_id = wallet.id
    LEFT JOIN customer customer ON wallet.customer_id = customer.id
    LEFT JOIN fuel_price fuel_price ON fuel_exchange.target_fuel_price_id = fuel_price.id
    LEFT JOIN fuel_type fuel_type ON wallet.fuel_type_id = fuel_type.id
    LEFT JOIN wallet source_wallet ON fuel_exchange.source_wallet_id = source_wallet.id
    LEFT JOIN fuel_type source_fuel_type ON source_wallet.fuel_type_id = source_fuel_type.id
    LEFT JOIN user user ON customer.user_id = user.id
  UNION
  SELECT CONCAT('T',transfer.id) id, 
  transfer.created, transfer.updated, transfer.deleted, 
  transfer.stamp, fuel_type.id AS fuel_type_id, 
  fuel_type.name AS fuel_type_name, NULL AS gas_station_id, 
  NULL AS gas_station_name, source_customer.first_name AS customer_first_name, source_customer.last_name AS customer_last_name, 
  source_customer.document_number AS customer_document_number, 
  NULL AS fuel_price, transfer.litres AS litres, 
  6 AS operation_type_id, 'Transferencia de litros' AS operation_type_name, 
  NULL AS pump_external_id, NULL AS authorization_status, NULL AS exchange_source_fuel_type, 
  user.id AS user_id, 
  NULL AS payment_method, 
  0 AS total,
  target_customer.first_name AS target_customer_first_name,
  target_customer.last_name AS target_customer_last_name,
  target_customer.document_number AS target_customer_document_number,
  target_user.id AS target_user_id,
  NULL AS transfer_withdrawal_id,
  NULL AS transfer_withdrawal_authorized,
  NULL AS purchase_status,
  NULL AS mp_payment_id,
  NULL AS mp_payment_method_id,
  LPAD(transfer.id, 8, '0') AS transaction_id
    FROM transfer transfer
    LEFT JOIN wallet source_wallet ON transfer.wallet_id = source_wallet.id
    LEFT JOIN customer source_customer ON source_wallet.customer_id = source_customer.id
    LEFT JOIN fuel_type fuel_type ON source_wallet.fuel_type_id = fuel_type.id
    LEFT JOIN user user ON source_customer.user_id = user.id
    LEFT JOIN transfer out_transfer ON transfer.transfer_id = out_transfer.id
    LEFT JOIN wallet target_wallet ON out_transfer.wallet_id = target_wallet.id
    LEFT JOIN customer target_customer ON target_wallet.customer_id = target_customer.id
    LEFT JOIN user target_user ON target_customer.user_id = target_user.id
  WHERE transfer.type = 'out'
  `,
})
export class Operation extends BaseModel {
  @ViewColumn()
  id: string = "";

  @ViewColumn()
  created: Date = new Date();

  @ViewColumn()
  updated: Date = new Date();

  @ViewColumn()
  deleted: boolean = false;

  @ViewColumn()
  stamp: Date = new Date();

  @ViewColumn()
  fuelTypeId: number = 0;

  @ViewColumn()
  fuelTypeName: string = "";

  @ViewColumn()
  gasStationName: string = "";

  @ViewColumn()
  gasStationId: number = 0;

  @ViewColumn()
  customerFirstName: string = "";

  @ViewColumn()
  customerLastName: string = "";

  @ViewColumn()
  customerDocumentNumber: string = "";

  @ViewColumn()
  fuelPrice: number = 0;

  @ViewColumn()
  litres: number = 0;

  @ViewColumn()
  operationTypeId: number = 0;

  @ViewColumn()
  operationTypeName: string = "";

  @ViewColumn()
  pumpExternalId: string | null = null;

  @ViewColumn()
  authorizationStatus: string = "";

  @ViewColumn()
  exchangeSourceFuelType: string = "";

  @ViewColumn()
  userId: number = 0;

  @ViewColumn()
  paymentMethod: PaymentMethodsEnum | null = null;

  @ViewColumn()
  total: number = 0;

  @ViewColumn()
  targetCustomerFirstName: string = "";

  @ViewColumn()
  targetCustomerLastName: string = "";

  @ViewColumn()
  targetCustomerDocumentNumber: string = "";

  @ViewColumn()
  targetUserId: number = 0;

  @ViewColumn()
  transferWithdrawalId: string | null = null;

  @ViewColumn()
  transferWithdrawalAuthorized: boolean | null = null;

  @ViewColumn()
  purchaseStatus: PurchaseStatusEnum | null = null;

  @ViewColumn()
  transactionId: string = "";

  @ViewColumn()
  mpPaymentId: string = "";

  @ViewColumn()
  mpPaymentMethodId: string = "";
}
