import {
    Purchase,
    PurchaseStatusEnum
} from "./../database/models/business/purchase.model";
import { MercadoPago } from "./../functions/mercado-pago.functions";
import express, { Router } from "express";
import { Request, Response } from "express";
import { getManager } from "typeorm";
import { PurchaseFunctions } from "../functions/purchase.functions";
const mercadopago = require("mercadopago");
export const ipnHandler = express.Router();

ipnHandler.post("/api/ipn/:purchaseId", async (req: Request, res: Response) => {
    const paymentId: number = +(req.query["data.id"] || req.query.id);
    const topic: string = req.query.topic || req.query.type;
    const purchaseId: number = +req.params.purchaseId;
    res.status(200).send();
    if (topic === "payment") {
        try {
            await PurchaseFunctions.updateMP({ paymentId, purchaseId });
        } catch (err) {
            console.log("Error when updating MP payment");
        }
    }
    //res.status(200).send();
});
