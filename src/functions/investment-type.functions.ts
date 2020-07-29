import { Quote } from "./../database/models/business/quote.model";
import { Investment } from "./../database/models/business/investment.model";
import { EntityToGraphResolver } from "./../core/entity-resolver";
import { GasStation } from "./../database/models/business/gas-station.model";
import { GraphQLResolveInfo } from "graphql";
import { InvestmentType } from "./../database/models/business/investment-type.model";

type PartialInvestmentType = Pick<InvestmentType, "id"> & Partial<InvestmentType>;

export interface IInvestmentTypePatchInput extends PartialInvestmentType {
    investmentTypeId?: number;
    quoteId?: number;
}

export interface IInvestmentTypeCreateInput extends PartialInvestmentType {
    investmentTypeId: number;
    quoteId: number;
}

export const InvestmentTypeFunctions = {
    create: async (
        { ...data }: IInvestmentTypeCreateInput,
        info: GraphQLResolveInfo
    ) => {
        try {
            
            const investment = Object.assign(new InvestmentType(), data);
            const { id } = await InvestmentType.create(investment);
            return await EntityToGraphResolver.find<InvestmentType>(
                id as number,
                InvestmentType,
                info
            );
        } catch (e) {
            console.log(e);
        }
    },
    edit: async (
        { id, ...data }: IInvestmentTypePatchInput,
        info: GraphQLResolveInfo
    ) => {
        await InvestmentType.update(id as number, data);
        return await EntityToGraphResolver.find<InvestmentType>(
            id as number,
            InvestmentType,
            info
        );
    }
};
