import { BaseViewModel } from './../../../core/models/base-view-model';
import {
    ViewEntity,
    ViewColumn,
    PrimaryColumn,
} from "typeorm";


@ViewEntity({
    expression: `
    SELECT o.customer_document_number, o.customer_first_name, o.customer_last_name, 
    SUM(if(o.operation_type_id IN (2), o.litres, 0)) AS total_sold, 
    SUM(if(o.operation_type_id IN (1,3,4), o.litres, 0)) AS total_delivered, 
    SUM(if(o.operation_type_id IN (2), o.litres, 0)) - SUM(if(o.operation_type_id IN (1,3,4), o.litres, 0)) AS total_pending
    FROM operation o
    GROUP BY o.customer_document_number, o.customer_first_name, o.customer_last_name
    ORDER BY o.customer_first_name, o.customer_last_name, o.fuel_type_name
    `,
})
export class OperationTotalsByCustomer extends BaseViewModel {
    @ViewColumn()
    @PrimaryColumn()
    customerDocumentNumber: number = 0;

    @ViewColumn()
    customerFirstName: string = "";

    @ViewColumn()
    customerLastName: string = "";

    @ViewColumn()
    totalSold: number = 0;

    @ViewColumn()
    totalDelivered: number = 0;

    @ViewColumn()
    totalPending: number = 0;

}
