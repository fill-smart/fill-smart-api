import { BaseModel } from "./../base.model";
import { Entity, Column, PrimaryColumn, getManager } from "typeorm";

export enum ParametersEnum {
  GracePeriod = "grace_period",
  ExchangeGracePeriod = "exchange_grace_period",
  PurchaseMaxLitres = "purchase_max_litres",
  WithdrawalMaxAmount = "withdrawal_max_amount",
  WithdrawalAmountMultiple = "withdrawal_amount_multiple",
  PaymentInStoreLimit = "payment_in_store_limit",
  ContactHelpEmails = "contact_help_emails",
  WithdrawalNotificationEmails = "withdrawal_notification_emails",
  WalletLitresLimit = "wallet_litres_limit",
  AccountLitresLimit = "account_litres_limit"
}

@Entity()
export class Parameter {
  @PrimaryColumn("varchar")
  name: string = "";

  @Column("varchar", { nullable: true })
  stringValue: string | null = null;

  @Column("text", { nullable: true })
  textValue: string | null = null;

  @Column("double", { nullable: true })
  numberValue: number | null = null;

  @Column("datetime", { nullable: true })
  dateValue: Date | null = null;

  public static async getByName(name: ParametersEnum) {
    return await getManager()
      .createQueryBuilder(Parameter, "p")
      .where("p.name = :name", { name })
      .getOne();
  }
}
