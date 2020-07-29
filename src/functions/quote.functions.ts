import { Quote } from "./../database/models/business/quote.model";
import { EntityToGraphResolver } from "./../core/entity-resolver";
import { GraphQLResolveInfo } from "graphql";
import { InvestmentType } from "./../database/models/business/investment-type.model";

type PartialQuote = Pick<Quote, "id"> & Partial<Quote>;

export interface IQuotePatchInput extends PartialQuote {
    investmentTypeId?: number;
    parentQuoteId?: number;
}

export interface IQuoteCreateInput extends PartialQuote {
    investmentTypeId: number;
    parentQuoteId?: number;
}

export const QuoteFunctions = {
    create: async (
        { ...data }: IQuoteCreateInput,
        info: GraphQLResolveInfo
    ) => {
        try {
            if (data.investmentTypeId) {
                data.investmentType = <Promise<InvestmentType>>(
                    InvestmentType.getById(data.investmentTypeId)
                );
            }

            if (data.parentQuoteId) {
                data.parentQuote = <Promise<Quote>>(
                    Quote.getById(data.parentQuoteId)
                );
            }
            const quote = Object.assign(new Quote(), data);
            const { id } = await Quote.create(quote);
            return await EntityToGraphResolver.find<Quote>(id as number, Quote, info);
        } catch (e) {
            console.log(e);
        }
    },
    edit: async (
        { id, ...data }: IQuotePatchInput,
        info: GraphQLResolveInfo
    ) => {
        if (data.investmentTypeId) {
            data.investmentType = <Promise<InvestmentType>>(
                InvestmentType.getById(data.investmentTypeId)
            );
        }

        if (data.parentQuoteId) {
            data.parentQuote = <Promise<Quote>>(
                Quote.getById(data.parentQuoteId)
            );
        }

        await Quote.update(id as number, data);
        return await EntityToGraphResolver.find<Quote>(id as number, Quote, info);
    }
};
