import { Parameter, ParametersEnum } from './../core/models/system/parameter.model';
import { Customer } from './../database/models/business/customer.model';
import { IDecodedToken } from "./security.functions";
import { GraphQLResolveInfo } from "graphql";
import { getManager } from "typeorm";
import Mailer from '../core/mailing/mailer';


export interface IHelpContactInput {
    message: string;
    contactType: "email" | "phone";
}

export const HelpCustomer = {
    sendHelpQuery: async (
        { ...data }: IHelpContactInput,
        info: GraphQLResolveInfo,
        context: { user: IDecodedToken }
    ) => {
        try {

            const customer = await getManager()
                .createQueryBuilder(Customer, "c")
                .leftJoin("c.user", "u")
                .where("u.Id = :userId", {
                    userId: context.user.id
                })
                .getOne();

            if (!customer) {
                throw "Customer doesn't exist";
            }

            const contactMails = await Parameter.getByName(ParametersEnum.ContactHelpEmails);

            if (!contactMails) {
                throw `Parameter ${ParametersEnum.ContactHelpEmails} is not set.`;
            }

            const recipients = contactMails.textValue?.split(",");
            if (!recipients) {
                throw `Parameter ${ParametersEnum.ContactHelpEmails} has no recipients values.`;
            }

            await Mailer.sendCustomerHelpQuery(
                customer.firstName.concat(" ", customer.lastName),
                data.message,
                data.contactType === "email" ? "Email" : "Teléfono",
                recipients
            )

            return { success: true };
        } catch (e) {
            console.log(e);
            return { success: false };
        }
    }
}