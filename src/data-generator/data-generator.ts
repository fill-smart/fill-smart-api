import { CashDeposit } from "./../database/models/business/cash-deposit.model";
import { Notification } from "./../database/models/business/notification.model";
import {
  Investment,
  InvestmentMovementTypeEnum,
} from "./../database/models/business/investment.model";
import { Quote } from "./../database/models/business/quote.model";
import { InvestmentType } from "./../database/models/business/investment-type.model";
import {
  Parameter,
  ParametersEnum,
} from "./../core/models/system/parameter.model";
import {
  Authorization,
  AuthorizationStatusEnum,
} from "./../database/models/business/authorization.model";
import { Cron } from "./../core/models/system/cron.model";
import { ShopPurchase } from "./../database/models/business/shop-purchase.model";
import { CashWithdrawal } from "./../database/models/business/cash-withdrawal.model";
import { Refuel } from "./../database/models/business/refuel.model";
import {
  Purchase,
  PurchaseStatusEnum,
  PaymentMethodsEnum,
} from "./../database/models/business/purchase.model";
import { GasTank } from "./../database/models/business/gas-tank.model";
import { GasStationAdministrator } from "./../database/models/business/gas-station-administrator.model";
import { GasStationFuelTypeMap } from "./../database/models/business/gas-station-fuel-type-map.model";
import { copyFile } from "./../utils/copy-file";
import { Image } from "./../database/models/business/image.model";
import { Document } from "./../database/models/business/document.model";
import {
  DocumentType,
  DocumentTypesEnum,
} from "./../database/models/business/document-type.model";
import { Pump } from "./../database/models/business/pump.model";
import { Seller } from "./../database/models/business/seller.model";
import { Role, RolesEnum } from "./../database/models/business/role.model";
import { GasStation } from "./../database/models/business/gas-station.model";
import { Wallet } from "./../database/models/business/wallet.model";
import { FuelPrice } from "./../database/models/business/fuel-price.model";
import { FuelType } from "./../database/models/business/fuel-type.model";
import { User } from "./../database/models/business/user.model";
import { getManager, EntityManager } from "typeorm";
import moment from "moment";
import {
  Customer,
  AccountStatusEnum,
} from "./../database/models/business/customer.model";
import bcrypt from "bcryptjs";
import {
  StringUtils,
  ArrayUtils,
  DateUtils,
  NumberUtils,
} from "@silentium-apps/fill-smart-common";
import { TermsConditions } from "../database/models/business/terms-conditions";

export const names: string[] = [
  "Santiago",
  "Sebastián",
  "Matías",
  "Mateo",
  "Nicolás",
  "Alejandro",
  "Diego",
  "Samuel",
  "Benjamín",
  "Daniel",
  "Joaquín",
  "Lucas",
  "Tomas",
  "Gabriel",
  "Martín",
  "David",
  "Emiliano",
  "Jerónimo",
  "Emmanuel",
  "Agustín",
  "Juan Pablo",
  "Juan José",
  "Andrés",
  "Thiago",
  "Leonardo",
  "Felipe",
  "Ángel",
  "Maximiliano",
  "Christopher",
  "Juan Diego",
  "Adrián",
  "Pablo",
  "Miguel Ángel",
  "Rodrigo",
  "Alexander",
  "Ignacio",
  "Emilio",
  "Dylan",
  "Bruno",
  "Carlos",
  "Vicente",
  "Valentino",
  "Santino",
  "Julián",
  "Juan Sebastián",
  "Aarón",
  "Lautaro",
  "Axel",
  "Fernando",
  "Ian",
  "Christian",
  "Javier",
  "Manuel",
  "Luciano",
  "Francisco",
  "Juan David",
  "Iker",
  "Facundo",
  "Rafael",
  "Alex",
  "Franco",
  "Antonio",
  "Luis",
  "Isaac",
  "Máximo",
  "Pedro",
  "Ricardo",
  "Sergio",
  "Eduardo",
  "Bautista",
  "Miguel",
  "Cristóbal",
  "Kevin",
  "Jorge",
  "Alonso",
  "Anthony",
  "Simón",
  "Juan",
  "Joshua",
  "Diego Alejandro",
  "Juan Manuel",
  "Mario",
  "Alan",
  "Josué",
  "Gael",
  "Hugo",
  "Matthew",
  "Ivan",
  "Damián",
  "Lorenzo",
  "Juan Martín",
  "Esteban",
  "Álvaro",
  "Valentín",
  "Dante",
  "Jacobo",
  "Jesús",
  "Camilo",
  "Juan Esteban",
  "Elías",
];

export const lastNames = [
  "García",
  "Fernández",
  "González",
  "Rodríguez",
  "López",
  "Martínez",
  "Sánchez",
  "Pérez",
  "Martín",
  "Gómez",
  "Dominguez",
  "Hernandez",
  "Lopez",
  "Ramirez",
  "Ruiz",
  "Suarez",
  "Velazquez",
  "Velez",
  "Bravo",
  "Cano",
  "Cola",
  "Cortes",
  "Delgado",
  "Garza",
  "Grand",
  "Moreno",
  "Orejon",
  "Rubio",
];

export const emailTerminations = [
  "@live.com",
  "@outlook.com",
  "@gmail.com",
  "@yahoo.com",
  "@mail.com",
];

export const loadCustomersAndUsers = async (
  em: EntityManager,
  roles: { [key: string]: Role },
  documentTypes: { [key: string]: DocumentType }
) => {
  const customers: Customer[] = [];

  for (let i = 0; i < 20; i++) {
    let hasValidName = false;
    let firstName = "";
    let lastName = "";
    while (!hasValidName) {
      firstName = ArrayUtils.randomFrom(names);
      lastName = ArrayUtils.randomFrom(lastNames);
      hasValidName = !customers.some(
        (customer) =>
          customer.lastName === lastName && customer.firstName === firstName
      );
    }
    const user = new User();
    user.username =
      i === 0
        ? "demo@demo.com"
        : StringUtils.removeAccents(
            firstName.toLowerCase() +
              "_" +
              lastName.toLowerCase() +
              ArrayUtils.randomFrom(emailTerminations)
          );
    user.password = await bcrypt.hash("Aa123456", 10);
    user.roles = Promise.resolve([roles[RolesEnum.Customer]]);
    const savedUser = await em.save(user);
    const customer = new Customer();
    customer.born = DateUtils.randomBetween(
      moment().subtract(80, "years").toDate(),
      moment().subtract(18, "years").toDate()
    );
    customer.activationCode = NumberUtils.randomBetween(1, 9999)
      .toString()
      .padStart(4, "0");
    customer.firstName = firstName;
    customer.lastName = lastName;
    customer.documentNumber = NumberUtils.randomBetween(
      11000000,
      40000000
    ).toString();
    // customer.email = StringUtils.removeAccents(
    //     firstName.toLowerCase() +
    //         "_" +
    //         lastName.toLowerCase() +
    //         ArrayUtils.randomFrom(emailTerminations)
    // );
    customer.phone =
      "+54387" + NumberUtils.randomBetween(1000000, 9999999).toString();
    customer.status = AccountStatusEnum.Active;
    customer.user = Promise.resolve(savedUser);
    const savedCustomer = await em.save(customer);
    customers.push(savedCustomer);
    for (var j = 0; j < Object.keys(documentTypes).length; j++) {
      const documentTypeName = Object.keys(documentTypes)[j];
      const documentType = documentTypes[documentTypeName];
      const document = new Document();
      document.documentType = Promise.resolve(documentType);
      document.customer = Promise.resolve(savedCustomer);
      document.name = documentTypeName;
      const savedDocument = await em.save(document);
      const image = new Image();
      image.document = Promise.resolve(savedDocument);
      const savedImage = await em.save(image);
      copyFile(
        `${__dirname}/../assets/${documentTypeName}.jpg`,
        `${__dirname}/../uploads/documents/${savedImage.id}.jpg`
      );
    }
  }

  const admin = new User();
  admin.username = "admin";
  admin.password = await bcrypt.hash("admin", 10);
  admin.roles = Promise.resolve([roles[RolesEnum.Administrator]]);
  await em.save(admin);

  const coverageOperator = new User();
  coverageOperator.username = "coverage";
  coverageOperator.password = await bcrypt.hash("coverage", 10);
  coverageOperator.roles = Promise.resolve([roles[RolesEnum.CoverageOperator]]);
  await em.save(coverageOperator);
  return customers;
};

export const loadFuels = async (em: EntityManager) => {
  let prices: FuelPrice[] = [];
  let fuels: FuelType[] = [];
  const naftas = ["Nafta Super", "Nafta Premium", "Diesel", "Euro Diesel"];

  for (let i = 0; i < naftas.length; i++) {
    const type = new FuelType();
    type.name = naftas[i];
    const savedType = await em.save(type);
    fuels.push(savedType);
    //historical fuel prices
    let price: number = NumberUtils.roundTo(
      NumberUtils.randomBetween(2000, 5000) / 100,
      2
    );

    let to: Date | null = null;
    let from: Date = moment()
      .subtract(NumberUtils.randomBetween(10, 25), "days")
      .toDate();
    for (let j = 1; j <= 24; j++) {
      const typePrice = new FuelPrice();
      typePrice.fuelType = Promise.resolve(type);
      typePrice.price = price;
      typePrice.to = to;
      typePrice.from = from;
      const decrement = NumberUtils.randomBetween(0, 100) / 100;

      price = NumberUtils.roundTo(price - decrement, 2);
      to = from;
      from = moment(from)
        .subtract(NumberUtils.randomBetween(10, 25), "days")
        .toDate();
      const savedPrice = await em.save(typePrice);
      prices.push(savedPrice);
    }
  }

  return { prices, fuels };
};

export const loadRoles = async (em: EntityManager) => {
  const roles: { [key: string]: Role } = {};
  const administrator = new Role();
  administrator.name = RolesEnum.Administrator;
  const savedAdministrator = await em.save(administrator);
  roles[RolesEnum.Administrator] = savedAdministrator;

  const customer = new Role();
  customer.name = RolesEnum.Customer;
  const savedCustomer = await em.save(customer);
  roles[RolesEnum.Customer] = savedCustomer;

  const seller = new Role();
  seller.name = RolesEnum.Seller;
  const savedSeller = await em.save(seller);
  roles[RolesEnum.Seller] = savedSeller;

  const gasStationAdministrator = new Role();
  gasStationAdministrator.name = RolesEnum.GasStationAdministrator;
  const savedGasStationAdministrator = await em.save(gasStationAdministrator);
  roles[RolesEnum.GasStationAdministrator] = savedGasStationAdministrator;

  const coverageOperator = new Role();
  coverageOperator.name = RolesEnum.CoverageOperator;
  const savedCoverageOperator = await em.save(coverageOperator);
  roles[RolesEnum.CoverageOperator] = savedCoverageOperator;

  return roles;
};

export const loadDocumentTypes = async (em: EntityManager) => {
  const documentTypes: { [key: string]: DocumentType } = {};
  const dniFront = new DocumentType();
  dniFront.name = DocumentTypesEnum.DniFront;
  const savedDniFront = await em.save(dniFront);
  documentTypes[DocumentTypesEnum.DniFront] = savedDniFront;

  const dniBack = new DocumentType();
  dniBack.name = DocumentTypesEnum.DniBack;
  const savedDniBack = await em.save(dniBack);
  documentTypes[DocumentTypesEnum.DniBack] = savedDniBack;

  return documentTypes;
};

export const loadWalletsForCustomers = async (
  em: EntityManager,
  customers: Customer[],
  fuelTypes: FuelType[]
) => {
  console.log("Generating Wallets...");
  console.log("Fuel Types...", fuelTypes.length);
  console.log("Customers...", customers.length);
  const wallets: Wallet[] = [];
  for (let c = 0; c < customers.length; c++) {
    for (let t = 0; t < fuelTypes.length; t++) {
      const wallet = new Wallet();
      wallet.customer = Promise.resolve(customers[c]);
      wallet.fuelType = Promise.resolve(fuelTypes[t]);
      wallet.litres = NumberUtils.randomBetween(0, 1500);
      const savedWallet = await em.save(wallet);
      wallets.push(savedWallet);
    }
  }
  return wallets;
};

export const findFuelPriceByTypeId = (id: number, fuelPrices: FuelPrice[]) => {
  return fuelPrices.find(async (price) => (await price.fuelType)?.id === id);
};

export const ExternalProductToInternalProduct: { [key: number]: number } = {
  1: 2,
  2: 3,
  3: 4,
  4: 5,
};

export const loadGasStationsAndPumps = async (
  em: EntityManager,
  fuelTypes: FuelType[],
  roles: { [key: string]: Role }
) => {
  const gasStations: GasStation[] = [];
  const pumps: { [gasStationId: number]: Pump[] } = {};
  //El Chango
  const elChango = new GasStation();
  elChango.address = "Av Paraguay, Av. Belgica Esq, 4400 Salta";
  elChango.lat = -24.8063451;
  elChango.lng = -65.4202375;
  elChango.name = "El Chango";
  elChango.externalWSUrl = "https://changosrl.caldenoil.com:50443";
  elChango.purchaseRequireAuthorization = false;

  const elChangoSaved = await em.save(elChango);

  gasStations.push(elChangoSaved);
  //Av Independencia
  const independencia = new GasStation();
  independencia.address = "Av. Independencia 775, 4400 Salta";
  independencia.lat = -24.8079684;
  independencia.lng = -65.4081358;
  independencia.name = "Independencia";
  independencia.externalWSUrl = "https://changosrl.caldenoil.com:50443";
  const independenciaSaved = await em.save(independencia);
  independencia.purchaseRequireAuthorization = true;
  gasStations.push(independenciaSaved);

  for (let i = 0; i < gasStations.length; i++) {
    const gasStation = gasStations[i];
    for (let j = 2; j <= 8; j++) {
      const pumpA = new Pump();
      pumpA.externalId = j.toString() + "|A";
      pumpA.gasStation = Promise.resolve(gasStation);
      const savedPumpA = await em.save(pumpA);
      if (pumps[gasStation.id as number]) {
        pumps[gasStation.id as number].push(savedPumpA);
      } else {
        pumps[gasStation.id as number] = [savedPumpA];
      }
      const pumpB = new Pump();
      pumpB.externalId = j.toString() + "|B";
      pumpB.gasStation = Promise.resolve(gasStation);
      const savedPumpB = await em.save(pumpB);
      if (pumps[gasStation.id as number]) {
        pumps[gasStation.id as number].push(savedPumpB);
      } else {
        pumps[gasStation.id as number] = [savedPumpB];
      }
    }
    //PArallel save
    const mappings: GasStationFuelTypeMap[] = fuelTypes.map((ft) => {
      const mapping = new GasStationFuelTypeMap();
      (mapping.externalCode = ExternalProductToInternalProduct[
        ft.id as number
      ].toString()),
        (mapping.gasStation = Promise.resolve(gasStation)),
        (mapping.fuelType = Promise.resolve(ft));
      return mapping;
    });
    await Promise.all(mappings.map((m) => em.save(m)));

    //create administrator
    const name =
      gasStation.name.toLowerCase().split(" ").join("_") + "_administrator";
    const gasStationAdministratorUser = new User();
    gasStationAdministratorUser.username =
      name + ArrayUtils.randomFrom(emailTerminations);
    gasStationAdministratorUser.password = await bcrypt.hash("Aa123456", 10);
    gasStationAdministratorUser.roles = Promise.resolve([
      roles[RolesEnum.GasStationAdministrator],
    ]);
    const savedGasStationAdministratorUser = await em.save(
      gasStationAdministratorUser
    );

    const gasStationAdministrator = new GasStationAdministrator();
    gasStationAdministrator.name = name;
    gasStationAdministrator.gasStation = Promise.resolve(gasStation);
    gasStationAdministrator.user = Promise.resolve(
      savedGasStationAdministratorUser
    );
    await em.save(gasStationAdministrator);

    //Create Tanks
    const fuelIdentifiers = Object.keys(fuelTypes);
    for (let f = 0; f < fuelIdentifiers.length; f++) {
      const fuelType = fuelTypes[f];
      const tanksAmmout = NumberUtils.randomBetween(1, 3);
      for (let a = 1; a <= tanksAmmout; a++) {
        const gasTank = new GasTank();
        gasTank.gasStation = Promise.resolve(gasStation);
        gasTank.litres = NumberUtils.randomBetween(0, 10000000) / 100;
        gasTank.fuelType = Promise.resolve(fuelType);
        gasTank.externalId =
          gasStation.name.toLowerCase().split(" ").join("_") +
          "_" +
          fuelType.name.toLowerCase().split(" ").join("_") +
          "_" +
          a;
        await em.save(gasTank);
      }
    }
  }

  return { gasStations, pumps };
};

export const loadPurchases = async (em: EntityManager, wallets: Wallet[]) => {
  const purchases: Purchase[] = [];

  for (let w = 0; w < wallets.length; w++) {
    const randomPurchasesAmmout = NumberUtils.randomBetween(1, 10);
    for (let c = 0; c < randomPurchasesAmmout; c++) {
      const purchase = new Purchase();
      purchase.wallet = Promise.resolve(wallets[w]);

      purchase.fuelPrice = Promise.resolve(
        await (<Promise<FuelPrice>>(
          FuelPrice.getById(<number>(await wallets[w].fuelType)?.id, em)
        ))
      );

      purchase.litres = NumberUtils.randomBetween(1, 199);
      purchase.preferenceId = "somePreferenceId";
      purchase.status = PurchaseStatusEnum.Completed;
      purchase.paymentMethod = PaymentMethodsEnum.Mercadopago;
      purchase.stamp = DateUtils.randomBetween(
        moment().subtract(1, "year").toDate(),
        moment().toDate()
      );
      const savedPurchase = await em.save(purchase);
      purchases.push(savedPurchase);
    }
  }
  return purchases;
};

export const loadSellers = async (
  em: EntityManager,
  gasStations: GasStation[],
  roles: { [key: string]: Role }
) => {
  const sellers: { [key: number]: Seller[] } = {};

  for (let g = 0; g < gasStations.length; g++) {
    const gasStation = gasStations[g];
    const gasStationSellers: Seller[] = [];
    for (let i = 0; i < 10; i++) {
      let hasValidName = false;
      let sellerName = "";
      while (!hasValidName) {
        sellerName =
          ArrayUtils.randomFrom(names) + " " + ArrayUtils.randomFrom(lastNames);
        hasValidName = !gasStationSellers.some(
          (seller) => seller.name === sellerName
        );
      }
      const seller = new Seller();
      seller.name = sellerName;
      seller.gasStation = Promise.resolve(gasStation);
      const user = new User();
      user.username = StringUtils.removeAccents(
        gasStation.name.toLowerCase().split(" ").join("_") +
          "_" +
          sellerName.toLowerCase().split(" ").join("_") +
          ArrayUtils.randomFrom(emailTerminations)
      );
      user.password = await bcrypt.hash("Aa123456", 10);
      user.roles = Promise.resolve([roles[RolesEnum.Seller]]);
      const savedUser = await em.save(user);
      seller.user = Promise.resolve(savedUser);
      const savedSeller = await em.save(seller);
      gasStationSellers.push(savedSeller);
      if (sellers[gasStation.id as number]) {
        sellers[gasStation.id as number].push(savedSeller);
      } else {
        sellers[gasStation.id as number] = [savedSeller];
      }
    }
  }
  return sellers;
};

export const loadRefuels = async (
  em: EntityManager,
  wallets: Wallet[],
  gasStations: GasStation[],
  pumps: { [gasStationId: number]: Pump[] },
  sellers: { [gasStationId: number]: Seller[] }
) => {
  const refuels: Refuel[] = [];

  for (let w = 0; w < wallets.length; w++) {
    const randomOperationsAmmout = NumberUtils.randomBetween(1, 10);
    for (let c = 0; c < randomOperationsAmmout; c++) {
      const refuel = new Refuel();
      refuel.wallet = Promise.resolve(wallets[w]);
      refuel.fuelType = wallets[w].fuelType;
      refuel.fuelPrice = Promise.resolve(
        await (<Promise<FuelPrice>>(
          FuelPrice.getById(<number>(await wallets[w].fuelType)?.id, em)
        ))
      );

      refuel.litres = NumberUtils.randomBetween(1, 199);

      refuel.pump = Promise.resolve(
        ArrayUtils.randomFrom(pumps[ArrayUtils.randomFrom(gasStations).id as number])
      );

      refuel.externalId = NumberUtils.randomBetween(9999, 99999999).toString();

      refuel.stamp = DateUtils.randomBetween(
        moment().subtract(1, "year").toDate(),
        moment().toDate()
      );

      const authorization = new Authorization();
      authorization.seller = Promise.resolve(
        ArrayUtils.randomFrom(
          sellers[
            ArrayUtils.randomFrom(
              Object.keys(sellers).map((gasStationId) => +gasStationId)
            )
          ]
        )
      );
      authorization.status = AuthorizationStatusEnum.Authorized;
      const savedAuthorization = await em.save(authorization);
      refuel.authorization = Promise.resolve(savedAuthorization);
      const savedRefuel = await em.save(refuel);
      refuels.push(savedRefuel);
    }
  }
  return refuels;
};

export const loadCashWithdrawals = async (
  em: EntityManager,
  wallets: Wallet[],
  sellers: { [gasStationId: number]: Seller[] }
) => {
  const cashWithdrawals: CashWithdrawal[] = [];

  for (let w = 0; w < wallets.length; w++) {
    const randomOperationsAmmout = NumberUtils.randomBetween(1, 10);
    for (let c = 0; c < randomOperationsAmmout; c++) {
      const cashWithdrawal = new CashWithdrawal();
      cashWithdrawal.wallet = Promise.resolve(wallets[w]);
      cashWithdrawal.fuelPrice = Promise.resolve(
        await (<Promise<FuelPrice>>(
          FuelPrice.getById(<number>(await wallets[w].fuelType)?.id, em)
        ))
      );

      cashWithdrawal.litres = NumberUtils.randomBetween(1, 199);

      cashWithdrawal.stamp = DateUtils.randomBetween(
        moment().subtract(1, "year").toDate(),
        moment().toDate()
      );

      const authorization = new Authorization();
      const seller = ArrayUtils.randomFrom(
        sellers[
          ArrayUtils.randomFrom(
            Object.keys(sellers).map((gasStationId) => +gasStationId)
          )
        ]
      );
      authorization.seller = Promise.resolve(seller);
      cashWithdrawal.gasStation = seller.gasStation;
      authorization.status = AuthorizationStatusEnum.Authorized;
      const savedAuthorization = await em.save(authorization);
      cashWithdrawal.authorization = Promise.resolve(savedAuthorization);
      const savedCashWithdrawal = await em.save(cashWithdrawal);
      cashWithdrawals.push(savedCashWithdrawal);
    }
  }
  return cashWithdrawals;
};

export const loadShopPurchases = async (
  em: EntityManager,
  wallets: Wallet[],
  sellers: { [gasStationId: number]: Seller[] }
) => {
  const shopPurchases: ShopPurchase[] = [];

  for (let w = 0; w < wallets.length; w++) {
    const randomOperationsAmmout = NumberUtils.randomBetween(1, 10);
    for (let c = 0; c < randomOperationsAmmout; c++) {
      const shopPurchase = new ShopPurchase();
      shopPurchase.wallet = Promise.resolve(wallets[w]);
      shopPurchase.fuelPrice = Promise.resolve(
        await (<Promise<FuelPrice>>(
          FuelPrice.getById(<number>(await wallets[w].fuelType)?.id, em)
        ))
      );
      const authorization = new Authorization();
      const seller = ArrayUtils.randomFrom(
        sellers[
          ArrayUtils.randomFrom(
            Object.keys(sellers).map((gasStationId) => +gasStationId)
          )
        ]
      );
      authorization.seller = Promise.resolve(seller);
      shopPurchase.gasStation = seller.gasStation;
      authorization.status = AuthorizationStatusEnum.Authorized;
      const savedAuthorization = await em.save(authorization);
      shopPurchase.authorization = Promise.resolve(savedAuthorization);
      shopPurchase.litres = NumberUtils.randomBetween(1, 199);

      shopPurchase.stamp = DateUtils.randomBetween(
        moment().subtract(1, "year").toDate(),
        moment().toDate()
      );
      const savedShopPurchase = await em.save(shopPurchase);
      shopPurchases.push(savedShopPurchase);
    }
  }
  return shopPurchases;
};

export const loadCrons = async (em: EntityManager) => {
  const crons: { [key: string]: Cron } = {};

  //El Chango
  const updateFuelPrices = new Cron();
  const cronName = "updateFuelPrices";
  updateFuelPrices.name = cronName;
  updateFuelPrices.expression = "*/15 * * * *";
  updateFuelPrices.description =
    "Job that updates fuel prices based on he gas station's prices";
  const saved = await em.save(updateFuelPrices);
  crons[cronName] = saved;

  return { crons };
};

export const loadParameters = async (em: EntityManager) => {
  const parameters: { [key: string]: Parameter } = {};

  const gracePeriod = new Parameter();
  gracePeriod.name = ParametersEnum.GracePeriod;
  gracePeriod.numberValue = 15;
  const saved = await em.save(gracePeriod);
  parameters[ParametersEnum.GracePeriod] = saved;

  const exchangeGracePeriod = new Parameter();
  exchangeGracePeriod.name = ParametersEnum.ExchangeGracePeriod;
  exchangeGracePeriod.numberValue = 10;
  const exchangeSaved = await em.save(exchangeGracePeriod);
  parameters[ParametersEnum.ExchangeGracePeriod] = exchangeSaved;

  const purchaseMaxLitres = new Parameter();
  purchaseMaxLitres.name = ParametersEnum.PurchaseMaxLitres;
  purchaseMaxLitres.numberValue = 10000;
  const purchaseSaved = await em.save(purchaseMaxLitres);
  parameters[ParametersEnum.PurchaseMaxLitres] = purchaseSaved;

  const withdrawalMaxAmount = new Parameter();
  withdrawalMaxAmount.name = ParametersEnum.WithdrawalMaxAmount;
  withdrawalMaxAmount.numberValue = 10000;
  const withdrawalMaxAmountSaved = await em.save(withdrawalMaxAmount);
  parameters[ParametersEnum.WithdrawalMaxAmount] = withdrawalMaxAmountSaved;

  const withdrawalAmountMultiple = new Parameter();
  withdrawalAmountMultiple.name = ParametersEnum.WithdrawalAmountMultiple;
  withdrawalAmountMultiple.numberValue = 100;
  const withdrawalAmountMultipleSaved = await em.save(withdrawalAmountMultiple);
  parameters[ParametersEnum.WithdrawalAmountMultiple] = withdrawalAmountMultipleSaved;

  const paymentInStoreLimit = new Parameter();
  paymentInStoreLimit.name = ParametersEnum.PaymentInStoreLimit;
  paymentInStoreLimit.numberValue = 100000;
  const paymentInStoreLimitSaved = await em.save(paymentInStoreLimit);
  parameters[ParametersEnum.PaymentInStoreLimit] = paymentInStoreLimitSaved;

  const contactHelpEmails = new Parameter();
  contactHelpEmails.name = ParametersEnum.ContactHelpEmails;
  contactHelpEmails.textValue = "fillsmart@gmail.com";
  const contactHelpEmailsSaved = await em.save(contactHelpEmails);
  parameters[ParametersEnum.ContactHelpEmails] = contactHelpEmailsSaved;

  const withdrawalNotificationEmails = new Parameter();
  withdrawalNotificationEmails.name = ParametersEnum.WithdrawalNotificationEmails;
  withdrawalNotificationEmails.textValue = "fillsmart@gmail.com";
  const withdrawalNotificationEmailsSaved = await em.save(contactHelpEmails);
  parameters[ParametersEnum.WithdrawalNotificationEmails] = withdrawalNotificationEmailsSaved;

  const walletLitresLimit = new Parameter();
  walletLitresLimit.name = ParametersEnum.WalletLitresLimit;
  walletLitresLimit.numberValue = 1500;
  const walletLitresLimitSaved = await em.save(walletLitresLimit);
  parameters[ParametersEnum.WalletLitresLimit] = walletLitresLimitSaved;

  const accountLitresLimit = new Parameter();
  accountLitresLimit.name = ParametersEnum.AccountLitresLimit;
  accountLitresLimit.numberValue = 6000;
  const accountLitresLimitSaved = await em.save(accountLitresLimit);
  parameters[ParametersEnum.AccountLitresLimit] = accountLitresLimitSaved;

  return { parameters };
};

export const loadTermsAndConditions = async (em: EntityManager) => {
  const parameters: { [key: string]: TermsConditions } = {};
  //El Chango
  const terms = new TermsConditions();
  terms.terms = `
  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vel dapibus diam. Etiam mattis elit eget faucibus scelerisque. Quisque luctus convallis nisl, sed vestibulum ex tempor ac. Phasellus tempor in ligula quis malesuada. Quisque odio mi, condimentum vel pretium sit amet, convallis sed velit. Nulla facilisi. Aliquam justo sapien, imperdiet eget tempus eu, facilisis id ligula. Maecenas urna enim, tempor non ante et, pharetra pretium nisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse ultrices, turpis ut vulputate ornare, elit urna molestie magna, vitae efficitur nulla nisi nec nisi. Nam vitae laoreet eros. Suspendisse luctus commodo tellus at porta. Vestibulum gravida libero erat, ac venenatis odio semper id. Aenean ornare est et diam vulputate, vitae ultrices dolor rhoncus. Proin nibh erat, bibendum ac turpis consequat, imperdiet fringilla dolor. Vivamus sed maximus ligula, et gravida ex.  
  Donec mattis, enim vitae molestie faucibus, velit sem consectetur est, in aliquam massa odio ut sapien. Pellentesque consequat tempus sapien id accumsan. Nam ultrices quis dui vulputate facilisis. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Sed sit amet diam finibus purus cursus interdum. Donec sapien arcu, pharetra non leo ornare, molestie mattis tellus. Aenean ac ex eget dolor facilisis rhoncus. Ut mattis id nisi gravida finibus. Morbi efficitur eget nisl in dapibus.  
  Integer est elit, dapibus a nisl a, bibendum elementum dui. Nullam volutpat risus eget condimentum sagittis. Integer sed est gravida, tempor nisi et, dapibus orci. Maecenas ante nibh, mollis at tincidunt condimentum, dignissim lacinia felis. Fusce sollicitudin felis diam, eget dignissim enim fermentum a. Vivamus facilisis cursus dui, at blandit mi vestibulum quis. Curabitur sit amet porttitor felis, a rutrum libero. Aliquam finibus arcu enim. Maecenas vulputate metus urna, eu tincidunt neque venenatis imperdiet. Vestibulum in erat vel purus facilisis ultricies quis nec lectus.  
  Quisque sit amet egestas odio. In feugiat ex ut ante scelerisque posuere. Aliquam sagittis finibus mauris, in tincidunt nunc porttitor quis. Aliquam erat volutpat. In felis turpis, pharetra sit amet venenatis in, fringilla non est. Cras nec metus vel leo faucibus aliquet. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Etiam rhoncus quam in erat ornare pharetra.  
  Suspendisse mollis gravida tellus, et volutpat ex consequat vitae. Donec ac sapien ultrices sapien ultrices varius. Maecenas vel blandit quam, eget vehicula eros. Aliquam ut hendrerit turpis. Phasellus viverra leo eget nisl scelerisque, non vestibulum leo vestibulum. Sed ac ante maximus nisi accumsan semper. Donec blandit, ipsum vel viverra dignissim, ligula arcu gravida mi, ut ullamcorper ipsum mi ac ex. Quisque euismod neque arcu, in consequat nibh eleifend eu. Morbi vitae gravida leo. Vivamus sagittis mollis semper. Aliquam auctor velit ut enim finibus bibendum.  
  Cras porta nunc et ipsum tempor, ut dapibus tellus cursus. Ut euismod, lacus quis facilisis tincidunt, nisl nibh cursus lacus, non porta orci ligula ut felis. Ut a mi ac sapien efficitur condimentum. Vivamus convallis turpis sit amet tortor vestibulum, tincidunt hendrerit elit finibus. Quisque posuere elit a nulla elementum, quis lacinia quam convallis. Etiam at consequat risus. Sed tincidunt nulla non odio venenatis, ac congue purus hendrerit. Etiam ultrices maximus massa vel eleifend. Sed mollis mollis dui, viverra luctus quam finibus id. Suspendisse mollis, lectus ac imperdiet eleifend, erat eros molestie metus, at mattis purus urna sed nunc. Integer justo turpis, scelerisque vel sapien in, euismod ultrices tortor. Integer vitae gravida enim.  
  Nulla varius erat velit, molestie tincidunt eros cursus et. Sed et metus et lectus ullamcorper efficitur et eget lorem. Nulla diam augue, ultrices non urna a, accumsan hendrerit risus. Aliquam finibus ipsum sem, in hendrerit arcu imperdiet vel. Curabitur ultrices a urna et efficitur. Duis quam diam, ultrices at sapien at, gravida cursus dui. Sed tincidunt quam quis ex feugiat placerat. Phasellus leo urna, fringilla sed est a, placerat cursus arcu. Vestibulum auctor nibh eget interdum blandit. Aliquam ut accumsan libero. Quisque in molestie velit. Nunc vehicula ex sed diam finibus rutrum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vivamus id lorem eu ligula consectetur convallis. In sagittis magna risus, non pellentesque neque volutpat eget.  
  Sed sed nisl at lacus rutrum maximus. Morbi tristique aliquet magna sed elementum. Donec pharetra tincidunt tortor eget faucibus. Curabitur ut sodales purus, sit amet interdum orci. Pellentesque mollis convallis quam, id aliquam sem mattis a. Nam vel nunc varius, tincidunt risus non, rutrum velit. In bibendum nisi ac tortor rutrum tempor. Integer id porta quam. Nam a justo eget ex scelerisque ullamcorper non vulputate nunc. Morbi sit amet hendrerit sapien. Nam nec neque accumsan est lacinia faucibus sed consectetur odio. Vestibulum in bibendum dolor. Integer cursus eros sit amet est gravida, eu imperdiet nisl aliquam. Vivamus tempor consectetur dolor, ullamcorper iaculis sem porta quis.  
  Cras id consectetur enim. Etiam sed augue ut massa pretium molestie. Mauris sagittis massa ac neque dignissim, vitae tincidunt mi luctus. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Sed ullamcorper non nibh nec malesuada. Nullam pulvinar lectus velit. Integer id tempor diam, nec rutrum augue.  
  Sed odio tortor, mollis ut leo sed, ultrices volutpat ligula. Mauris fermentum felis diam, vel fringilla dui placerat in. Quisque a justo varius, tincidunt odio id, eleifend elit. Nullam hendrerit lobortis eros at tempor. Morbi eget accumsan sapien. Duis maximus orci quis convallis aliquet. Etiam urna tortor, tristique sit amet pulvinar elementum, fringilla sit amet mi. Nam euismod pellentesque augue, eu consectetur risus feugiat quis. In imperdiet convallis volutpat. Maecenas cursus blandit diam. Duis ut magna nec dolor auctor pretium. Vivamus non nulla urna.`;
  const saved = await em.save(terms);
  return { terms };
};

export const loadInvestments = async (em: EntityManager) => {
  const types: Array<InvestmentType> = [];
  const usd = new InvestmentType();
  usd.name = "Dolar";
  types.push(await em.save(usd));

  const petrol = new InvestmentType();
  petrol.name = "Barril de Petroleo";
  types.push(await em.save(petrol));

  const quotes: Array<Quote> = [];

  const usdQuote = new Quote();
  usdQuote.investmentType = Promise.resolve(types[0]);
  usdQuote.price = 74.5;
  usdQuote.from = moment().startOf("day").toDate();
  quotes.push(await em.save(usdQuote));

  const petrolQuote = new Quote();
  petrolQuote.investmentType = Promise.resolve(types[1]);
  petrolQuote.price = NumberUtils.randomBetween(100, 200);
  petrolQuote.from = moment().startOf("month").toDate();
  petrolQuote.parentQuote = Promise.resolve(quotes[0]);
  quotes.push(await em.save(petrolQuote));

  //Investments
  const investments: Array<Investment> = [];

  const usdPurchaseInvestment = new Investment();
  usdPurchaseInvestment.investmentType = Promise.resolve(types[0]);
  usdPurchaseInvestment.movementType = InvestmentMovementTypeEnum.Purchase;
  usdPurchaseInvestment.quote = Promise.resolve(quotes[0]);
  usdPurchaseInvestment.ammount = NumberUtils.randomBetween(1, 15) * 1000;
  usdPurchaseInvestment.stamp = new Date();
  usdPurchaseInvestment.dueDate = moment()
    .add(NumberUtils.randomBetween(1, 20), "days")
    .toDate();
  investments.push(await em.save(usdPurchaseInvestment));

  const petroleumPurchaseInvestment = new Investment();
  petroleumPurchaseInvestment.investmentType = Promise.resolve(types[1]);
  petroleumPurchaseInvestment.movementType =
    InvestmentMovementTypeEnum.Purchase;
  petroleumPurchaseInvestment.quote = Promise.resolve(quotes[1]);
  petroleumPurchaseInvestment.ammount = NumberUtils.randomBetween(10, 30);
  petroleumPurchaseInvestment.stamp = new Date();
  petroleumPurchaseInvestment.dueDate = moment()
    .add(NumberUtils.randomBetween(1, 20), "days")
    .toDate();
  investments.push(await em.save(petroleumPurchaseInvestment));

  return { investments, quotes, types };
};

export const loadNotifications = async (em: EntityManager) => {
  const notifications: Array<Notification> = [];
  const notification = new Notification();
  notification.title = "Viernes de Descuento";
  notification.text =
    "Todos los viernes de Marzo 30% de descuento en Nafta Super. Aprovechalo!";
  notifications.push(await em.save(notification));

  return { notifications };
};

export const loadCashDeposits = async (
  em: EntityManager,
  gasStations: GasStation[]
) => {
  const deposits: Array<CashDeposit> = [];
  for (let g = 0; g < gasStations.length; g++) {
    for (let i = 0; i < 10; i++) {
      const deposit = new CashDeposit();
      deposit.amount = NumberUtils.randomBetween(2000, 200000);
      deposit.stamp = moment()
        .subtract(10 - i, "days")
        .subtract(NumberUtils.randomBetween(1, 20), "hours")
        .toDate();
      deposit.receipt = NumberUtils.randomBetween(1, 999999)
        .toString()
        .padStart(6, "0");
      deposit.gasStation = Promise.resolve(gasStations[g]);
      deposits.push(await em.save(deposit));
    }
  }

  return { deposits };
};

export const generateData = async () => {
  await getManager().transaction(async (em) => {
    const documentTypes = await loadDocumentTypes(em);
    const { prices, fuels } = await loadFuels(em);
    const roles = await loadRoles(em);
    const customers = await loadCustomersAndUsers(em, roles, documentTypes);
    const wallets = await loadWalletsForCustomers(em, customers, fuels);
    const { gasStations, pumps } = await loadGasStationsAndPumps(
      em,
      fuels,
      roles
    );
    const sellers = await loadSellers(em, gasStations, roles);
    const purchases = await loadPurchases(em, wallets);
    const refuels = await loadRefuels(em, wallets, gasStations, pumps, sellers);
    const shopPurchases = await loadShopPurchases(em, wallets, sellers);
    const cashWithdrawals = await loadCashWithdrawals(em, wallets, sellers);
    const { crons } = await loadCrons(em);
    const { parameters } = await loadParameters(em);
    const { terms } = await loadTermsAndConditions(em);
    const { investments, quotes, types } = await loadInvestments(em);
    const { notifications } = await loadNotifications(em);
    const { deposits } = await loadCashDeposits(em, gasStations);
  });
};
