import { Role, RolesEnum } from "./../database/models/business/role.model";
import { GasStation } from "./../database/models/business/gas-station.model";
import {
    Operation,
    PaymentMethodsEnum,
    OperationStatusEnum
} from "./../database/models/business/operation.model";
import { Wallet } from "./../database/models/business/wallet.model";
import { FuelPrice } from "./../database/models/business/fuel-price.model";
import { FuelType } from "./../database/models/business/fuel-type.model";
import {
    OperationType,
    OperationTypesEnum
} from "./../database/models/business/operation-type.model";
import { User } from "./../database/models/business/user.model";
import { getManager, EntityManager } from "typeorm";
import moment from "moment";
import {
    Customer,
    AccountStatusEnum
} from "./../database/models/business/customer.model";
import bcrypt from "bcrypt";
import StringUtils from "../utils/string-utils";
import ArrayUtils from "../utils/array-utils";
import NumberUtils from "../utils/number-utils";
import DateUtils from "../utils/date-utils";

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
    "Elías"
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
    "Rubio"
];

export const emailTerminations = [
    "@live.com",
    "@outlook.com",
    "@gmail.com",
    "@yahoo.com",
    "@mail.com"
];

export const loadCustomersAndUsers = async (
    em: EntityManager,
    roles: { [key: string]: Role }
) => {
    const customers: Customer[] = [];

    for (let i = 0; i < 50; i++) {
        let hasValidName = false;
        let firstName = "";
        let lastName = "";
        while (!hasValidName) {
            firstName = ArrayUtils.randomFrom(names);
            lastName = ArrayUtils.randomFrom(lastNames);
            hasValidName = !customers.some(
                customer =>
                    customer.lastName === lastName &&
                    customer.firstName === firstName
            );
        }
        const user = new User();
        user.username = StringUtils.removeAccents(
            firstName.toLowerCase() + "_" + lastName.toLowerCase()
        );
        user.password = await bcrypt.hash("Aa123456", 10);
        user.roles = Promise.resolve([roles[RolesEnum.Customer]]);
        const savedUser = await em.save(user);
        const customer = new Customer();
        customer.born = DateUtils.randomBetween(
            moment()
                .subtract(80, "years")
                .toDate(),
            moment()
                .subtract(18, "years")
                .toDate()
        );
        customer.firstName = firstName;
        customer.lastName = lastName;
        customer.documentNumber = NumberUtils.randomBetween(
            11000000,
            40000000
        ).toString();
        customer.email = StringUtils.removeAccents(
            firstName.toLowerCase() +
                "_" +
                lastName.toLowerCase() +
                ArrayUtils.randomFrom(emailTerminations)
        );
        customer.phone =
            "+54387" + NumberUtils.randomBetween(1000000, 9999999).toString();
        customer.status = AccountStatusEnum.Active;
        customer.user = Promise.resolve(savedUser);
        const savedCustomer = await em.save(customer);
        customers.push(savedCustomer);
    }

    const admin = new User();
    admin.username = "admin";
    admin.password = await bcrypt.hash("admin", 10);
    admin.roles = Promise.resolve([roles[RolesEnum.Administrator]]);
    await em.save(admin);
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

        const typePrice = new FuelPrice();
        typePrice.fuelType = Promise.resolve(type);
        typePrice.price = NumberUtils.randomBetween(2000, 5000) / 100;
        const savedPrice = await em.save(typePrice);
        prices.push(savedPrice);
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

    return roles;
};

export const loadOperationTypes = async (em: EntityManager) => {
    let operationTypes: OperationType[] = [];

    const types = [
        OperationTypesEnum.Recarga,
        OperationTypesEnum.CanjeDeCombustible,
        OperationTypesEnum.CompraDeCombustible,
        OperationTypesEnum.ExtraccionEfectivo,
        OperationTypesEnum.CompraEnShop
    ];

    for (let i = 0; i < types.length; i++) {
        const type = new OperationType();
        type.name = types[i];
        const savedType = await em.save(type);
        operationTypes.push(savedType);
    }

    return operationTypes;
};

export const loadWalletsForCustomers = async (
    em: EntityManager,
    customers: Customer[],
    fuelTypes: FuelType[]
) => {
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
    return fuelPrices.find(async price => (await price.fuelType)?.id === id);
};

export const loadGasStations = async (em: EntityManager) => {
    const gasStations: GasStation[] = [];
    //El Chango
    const elChango = new GasStation();
    elChango.address = "Av Paraguay, Av. Belgica Esq, 4400 Salta";
    elChango.lat = -24.8063451;
    elChango.lng = -65.4202375;
    elChango.name = "El Chango";
    const elChangoSaved = await em.save(elChango);
    gasStations.push(elChangoSaved);
    //Av Independencia
    const independencia = new GasStation();
    independencia.address = "Av. Independencia 775, 4400 Salta";
    independencia.lat = -24.8079684;
    independencia.lng = -65.4081358;
    independencia.name = "Independencia";
    const independenciaSaved = await em.save(independencia);
    gasStations.push(independenciaSaved);
    return gasStations;
};

export const loadOperations = async (
    em: EntityManager,
    wallets: Wallet[],
    operationTypes: OperationType[],
    gasStations: GasStation[]
) => {
    const operations: Operation[] = [];

    for (let w = 0; w < wallets.length; w++) {
        for (let t = 0; t < operationTypes.length; t++) {
            const randomOperationsAmmout = NumberUtils.randomBetween(1, 10);
            for (let c = 0; c < randomOperationsAmmout; c++) {
                const operation = new Operation();
                operation.wallet = Promise.resolve(wallets[w]);
                operation.fuelType = wallets[w].fuelType;
                operation.operationType = Promise.resolve(operationTypes[t]);
                operation.fuelPrice = Promise.resolve(
                    await (<Promise<FuelPrice>>(
                        FuelPrice.getById(
                            <number>(await wallets[w].fuelType)?.id,
                            em
                        )
                    ))
                );

                operation.litres = NumberUtils.randomBetween(1, 199);
                operation.gasStation = Promise.resolve(
                    ArrayUtils.randomFrom(gasStations)
                );
                operation.externalId = "someRandomExternalId";
                operation.paymentMethod =
                    NumberUtils.randomBetween(0, 10) > 5
                        ? PaymentMethodsEnum.Cash
                        : PaymentMethodsEnum.Mercadopago;
                operation.stamp = DateUtils.randomBetween(
                    moment()
                        .subtract(1, "year")
                        .toDate(),
                    moment().toDate()
                );
                operation.status = OperationStatusEnum.Completed;
                const savedOperation = await em.save(operation);
                operations.push(savedOperation);
            }
        }
    }
    return operations;
};

export const loadFixturesData = async () => {
    getManager().transaction(async em => {
        const fuelsWithTypes = await loadFuels(em);
        const roles = await loadRoles(em);
        const customers = await loadCustomersAndUsers(em, roles);
        const wallets = await loadWalletsForCustomers(
            em,
            customers,
            fuelsWithTypes.fuels
        );
        const operationTypes = await loadOperationTypes(em);
        const gasStations = await loadGasStations(em);
        const operations = await loadOperations(
            em,
            wallets,
            operationTypes,
            gasStations
        );
    });
};
