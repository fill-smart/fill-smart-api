import { GasStationAdministrator } from "./../database/models/business/gas-station-administrator.model";
import { getManager } from "typeorm";
import { EntityToGraphResolver } from "../core/entity-resolver";
import { GraphQLResolveInfo } from "graphql";
import { CashDeposit } from "../database/models/business/cash-deposit.model";
import { IDecodedToken } from "./security.functions";

type PartialCashDeposit = Pick<CashDeposit, "id" | "amount" | "receipt"> &
  Partial<CashDeposit>;

export interface ICashDepositCreateInput extends PartialCashDeposit {}

export const CashDepositFunctions = {
  create: async (
    { ...data }: ICashDepositCreateInput,
    info: GraphQLResolveInfo,
    context: { user: IDecodedToken }
  ) => {
    try {
      const deposit = Object.assign(new CashDeposit(), data);
      const administrator = await getManager()
        .createQueryBuilder(GasStationAdministrator, "g")
        .leftJoin("g.gasStation", "gas")
        .leftJoin("g.user", "u")
        .where("u.id = :userId", {
          userId: context.user.id
        })
        .getOne();
      if (!administrator) {
        throw "Is not a gas station administrator";
      }
      const gasStation = await administrator.gasStation;
      if (!gasStation) {
        throw "has no gas station";
      }
      deposit.gasStation = Promise.resolve(gasStation);
      const { id } = await CashDeposit.create(deposit);
      return await EntityToGraphResolver.find<CashDeposit>(
        id as number,
        CashDeposit,
        info
      );
    } catch (e) {
      console.log(e);
    }
  }
};
