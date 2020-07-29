import { Customer } from "../database/models/business/customer.model";

export interface IRegisterRequest {
    firstName: string;
    lastName: string;
    documentNumber: string;
    born: Date;
    phone: string;
    username: string;
    password: string;
    dniFrontImage: string;
    dniBackImage: string;
    imagesRotation?: number;
}

export interface IRegisterResult {
    customer: Customer;
}

export interface IActivateAccountRequest {
    code: string;
}

export interface IActivateAccountResult {
    success: boolean;
}
