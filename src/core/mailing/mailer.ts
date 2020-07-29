import {
  environmentalConfig,
  getCurrentEnvironmentalConfig
} from "./../env/env";
import nodemailer from "nodemailer";
import ejs from "ejs";
import moment from "moment";

const Mailer = {
  send: async (to: string[], subject: string, html: string) => {
    try {
      const config = await getCurrentEnvironmentalConfig();
      const transporter = nodemailer.createTransport({
        service: config.mailer.service,
        auth: {
          user: config.mailer.user,
          pass: config.mailer.password
        }
      });

      await transporter.sendMail({
        from: `"${config.mailer.alias}" <${config.mailer.user}>`,
        to: to.join(", "),
        subject,
        html
      });
    } catch (e) {
      console.log(e);
    }
  },
  generateHtml: (
    templateName: string,
    data: { [key: string]: any }
  ): Promise<string> => {
    return new Promise<string>(async (resolve, reject) => {
      ejs.renderFile(
        `${__dirname}/templates/${templateName}.ejs`,
        { ...data, imagesPath: await Mailer.imagesPath() },
        (err, html) => {
          if (err) {
            reject(err);
          }
          resolve(html);
        }
      );
    });
  },
  sendActivationCode: async (code: string, to: string) => {
    const html = await Mailer.generateHtml("sendActivationCode", { code });
    await Mailer.send([to], "Activar su cuenta FillSmart", html);
  },
  sendPasswordResetCode: async (code: string, to: string) => {
    const html = await Mailer.generateHtml("sendResetPasswordCode", { code });
    await Mailer.send([to], "Codigo para restablecer su cuenta FillSmart", html);
  },
  sendCustomerHelpQuery: async (customerName: string, message: string, contactMethod: string, to: string[]) => {
    const html = await Mailer.generateHtml("sendContactForm", {
      user: customerName,
      message: message,
      contactMethod: contactMethod
    });
    await Mailer.send(to, "Nueva consulta de fillsmart", html);
  },
  sendWithdrawalNotification: async (customerName: string, amount: number, to: string[]) => {
    const html = await Mailer.generateHtml("sendWithdrawalNotification", {
      user: customerName,
      amount: amount,
    });
    await Mailer.send(to, "Nueva solicitud de retiro de dinero", html);
  },
  sendPurchaseReceipt: async (fuelType: string, litres: number, total: number, operationId: number, stamp: Date, to: string[]) => {
    const html = await Mailer.generateHtml("sendPurchaseReceipt", {
      fuelType: fuelType,
      litres: litres.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      }),
      total: total.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }),
      operationId: operationId.toString().padStart(8, "0"),
      operationDate: moment(stamp).format("DD/MM/YYYY"),
      operationTime: moment(stamp).format("HH:mm"),
    });
    await Mailer.send(to, "Su recibo de compra de combustible", html);
  },
  sendWithdrawalReceipt: async (total: number, wallet: string, litres: number, operationId: number, stamp: Date, to: string[]) => {
    const html = await Mailer.generateHtml("sendWithdrawalReceipt", {
      total: total.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      }),
      wallet: wallet,
      litres: litres.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      }),
      operationId: operationId.toString().padStart(8, "0"),
      operationDate: moment(stamp).format("DD/MM/YYYY"),
      operationTime: moment(stamp).format("HH:mm"),
    });
    await Mailer.send(to, "Su recibo de retiro de fondos", html);
  },
  sendPaymentInStoreReceipt: async (fuelType: string, litres: number, total: number, operationId: number, stamp: Date, to: string[]) => {
    const html = await Mailer.generateHtml("sendPayInSotreReceipt", {
      fuelType: fuelType,
      litres: litres.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      }),
      total: total.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }),
      operationId: operationId.toString().padStart(8, "0"),
      operationDate: moment(stamp).format("DD/MM/YYYY"),
      operationTime: moment(stamp).format("HH:mm"),
    });
    await Mailer.send(to, "Su recibo de pago en tienda", html);
  },
  sendRefuelReceipt: async (fuelTypeRefuel: string, litresRefuel: number, fuelTypePayment: string,
    litres: number, total: number, operationId: number, stamp: Date, to: string[]) => {
    const html = await Mailer.generateHtml("sendRefuelReceipt", {
      fuelTypeRefuel: fuelTypeRefuel,
      litresRefuel: litresRefuel.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      }),
      fuelTypePayment: fuelTypePayment,
      litres: litres.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      }),
      total: total.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }),
      operationId: operationId.toString().padStart(8, "0"),
      operationDate: moment(stamp).format("DD/MM/YYYY"),
      operationTime: moment(stamp).format("HH:mm"),
    });
    await Mailer.send(to, "Su recibo de carga de combustible", html);
  },
  sendExchangeReceipt: async (sourceWallet: string, sourceLitres: number, targetWallet: string, targetLitres: number, operationId: number, stamp: Date, to: string[]) => {
    const html = await Mailer.generateHtml("sendExchangeReceipt", {
      sourceLitres: sourceLitres.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      }),
      sourceWallet: sourceWallet,
      targetLitres: targetLitres.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      }),
      targetWallet: targetWallet,
      operationId: operationId.toString().padStart(8, "0"),
      operationDate: moment(stamp).format("DD/MM/YYYY"),
      operationTime: moment(stamp).format("HH:mm"),
    });
    await Mailer.send(to, "Su recibo de Canje de billeteras", html);
  },
  test: async (to: string) => {
    const html = await Mailer.generateHtml("sendActivationCode", {
      code: "1234"
    });
    await Mailer.send([to], "test", html);
  },
  imagesPath: async () => {
    return `${(await getCurrentEnvironmentalConfig()).serverUrl.replace(
      "/api",
      ""
    )}/assets/`;
  }
};

export default Mailer;
