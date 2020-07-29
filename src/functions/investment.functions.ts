import { Quote } from "./../database/models/business/quote.model";
import { Investment } from "./../database/models/business/investment.model";
import { EntityToGraphResolver } from "./../core/entity-resolver";
import { GasStation } from "./../database/models/business/gas-station.model";
import { GraphQLResolveInfo } from "graphql";
import { InvestmentType } from "./../database/models/business/investment-type.model";

type PartialInvestment = Pick<Investment, "id"> & Partial<Investment>;

export interface IInvestmentPatchInput extends PartialInvestment {
    investmentTypeId?: number;
    quoteId?: number;
}

export interface IInvestmentCreateInput extends PartialInvestment {
    investmentTypeId: number;
    quoteId: number;
}

export const InvestmentFunctions = {
    create: async (
        { ...data }: IInvestmentCreateInput,
        info: GraphQLResolveInfo
    ) => {
        try {
            if (data.investmentTypeId) {
                data.investmentType = <Promise<InvestmentType>>(
                    InvestmentType.getById(data.investmentTypeId)
                );
            }

            if (data.quoteId) {
                data.quote = <Promise<Quote>>Quote.getById(data.quoteId);
            }
            const investment = Object.assign(new Investment(), data);
            const { id } = await Investment.create(investment);
            return await EntityToGraphResolver.find<Investment>(
                id as number,
                Investment,
                info
            );
        } catch (e) {
            console.log(e);
        }
    },
    edit: async (
        { id, ...data }: IInvestmentPatchInput,
        info: GraphQLResolveInfo
    ) => {
        if (data.investmentTypeId) {
            data.investmentType = <Promise<InvestmentType>>(
                InvestmentType.getById(data.investmentTypeId)
            );
        }

        if (data.quoteId) {
            data.quote = <Promise<Quote>>Quote.getById(data.quoteId);
        }

        await Investment.update(id as number, data);
        return await EntityToGraphResolver.find<Investment>(
            id as number,
            Investment,
            info
        );
    }
};
