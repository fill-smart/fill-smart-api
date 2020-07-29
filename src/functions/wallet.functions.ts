import { FuelExchange } from "./../database/models/business/fuel-exchange.model";
import {
  Parameter,
  ParametersEnum
} from "./../core/models/system/parameter.model";
import {
  Purchase,
  PurchaseStatusEnum
} from "./../database/models/business/purchase.model";
import { getCurrentEnvironmentalConfig } from "./../core/env/env";
import { Wallet } from "./../database/models/business/wallet.model";
import { getManager, EntityManager } from "typeorm";
import moment from "moment";

export interface IAddFuelToWalletInput {
  walletId: number;
  litres: number;
  em: EntityManager;
}

export const WalletFunctions = {
  availableLitres: async (walletId: number, dueDate?: Date): Promise<number> => {
    try {
      const wallet = <Wallet>await Wallet.getById(walletId);
      const gracePeriod = await Parameter.getByName(ParametersEnum.GracePeriod);
      if (!gracePeriod) {
        throw "Grace period is not set";
      }
      const transferGracePeriod = await Parameter.getByName(
        ParametersEnum.ExchangeGracePeriod
      );
      if (!transferGracePeriod) {
        throw "Transfer grace period is not set";
      }
      const limitDay = moment(dueDate)
        .subtract(gracePeriod.numberValue as number, "days")
        .endOf("day")
        .toDate();
      const transferLimitDay = moment(dueDate)
        .subtract(transferGracePeriod.numberValue as number, "days")
        .endOf("day")
        .toDate();
      const status = PurchaseStatusEnum.Completed;
      const {
        litresInGracePeriod
      }: { litresInGracePeriod: number } = await getManager()
        .createQueryBuilder(Purchase, "p")
        .select("sum(p.litres)", "litresInGracePeriod")
        .leftJoin("p.wallet", "w")
        .where("p.stamp > :limitDay and w.id = :walletId", {
          limitDay,
          walletId
        })
        .andWhere("p.status = :status", { status })
        .getRawOne();

      const {
        transferLitresInGracePeriod
      }: { transferLitresInGracePeriod: number } = await getManager()
        .createQueryBuilder(FuelExchange, "e")
        .select("sum(e.targetLitres)", "transferLitresInGracePeriod")
        .leftJoin("e.targetWallet", "w")
        .where("e.stamp > :transferLimitDay and w.id = :walletId", {
          transferLimitDay,
          walletId
        })
        .getRawOne();
      const availableLts = wallet.litres - litresInGracePeriod - transferLitresInGracePeriod;
      return availableLts > 0 ? availableLts : 0;

    } catch (e) {
      throw e;
    }
  },
  addFuelToWallet: async (data: IAddFuelToWalletInput) => {
    const em = data.em ?? getManager();
    const wallet = <Wallet>await Wallet.getById(data.walletId);
    wallet.litres += data.litres;
    await em.save(wallet);
  }
};
