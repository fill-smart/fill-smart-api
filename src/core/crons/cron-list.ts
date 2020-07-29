import { getCurrentEnvironmentalConfig } from "./../env/env";
import {
  Authorization,
  AuthorizationStatusEnum,
} from "./../../database/models/business/authorization.model";
import { FuelPrice } from "./../../database/models/business/fuel-price.model";
import { GasStationFuelTypeMap } from "./../../database/models/business/gas-station-fuel-type-map.model";
import { callGetFuelPrices } from "./../../external/external-operations";
import * as Scheduler from "node-cron";
import { Cron } from "./../models/system/cron.model";
import { getManager } from "typeorm";
import moment from "moment";
import { executeCommand } from "../cli/command-executor";
export const CronList: { [name: string]: () => void } = {
  updateFuelPrices: () => {
    callGetFuelPrices().then(async (fuelPrices) => {
      const transaction = await getManager().transaction(async (em) => {
        try {
          await Promise.all(
            fuelPrices.value.map(async (gasStationPrice) => {
              const gasStationId = 1;
              const fuelTypeExternalCode = gasStationPrice.item_id.toString();
              const fuelPriceMapped = await em
                .createQueryBuilder(GasStationFuelTypeMap, "m")
                .leftJoin("m.gasStation", "g")
                .leftJoin("m.fuelType", "t")
                .where("g.id = :gasStationId", {
                  gasStationId,
                })
                .andWhere("m.externalCode = :fuelTypeExternalCode", {
                  fuelTypeExternalCode,
                })
                .getOne();
              if (!fuelPriceMapped) {
                console.log("there is no fuel price corresponding that id");
                return;
              }
              const fuelTypeId = (await fuelPriceMapped!.fuelType!).id;
              const currentFuelPrice = await em
                .createQueryBuilder(FuelPrice, "p")
                .leftJoin("p.fuelType", "t")
                .where("t.id = :fuelTypeId", { fuelTypeId })
                .andWhere("p.to is null")
                .getOne();
              if (currentFuelPrice) {
                if (currentFuelPrice.price === gasStationPrice.price) {
                  console.log("Fuel price remains the same, no need to update");
                } else {
                  console.log("Fuel price needs update");
                  //Set to to old price
                  const now = new Date();
                  currentFuelPrice.to = now;
                  await em.save(currentFuelPrice);
                  //create new price
                  const newPrice = new FuelPrice();
                  newPrice.fuelType = currentFuelPrice.fuelType;
                  newPrice.from = currentFuelPrice.to;
                  newPrice.to = null;
                  newPrice.price = gasStationPrice.price;
                  await em.save(newPrice);
                }
              } else {
                console.log("First price should be loaded manually");
              }
            })
          );
          console.log("Prices Updated");
        } catch (e) {
          console.log("Error: ", e);
        }
        if (!fuelPrices.success) {
          console.log(
            "Error when trying to update the fuel prices, the Gas Station API returned unsuccessfull response"
          );
        }
      });
    });
  },
  rejectOldAuthorizations: () => {
    const transaction = getManager().transaction(async (em) => {
      try {
        const yesterday = moment().subtract(1, "day").toDate();
        const pending = AuthorizationStatusEnum.Pending;
        const oldAuthorizations = await em
          .createQueryBuilder(Authorization, "a")
          .where("a.stamp < :yesterday", { yesterday })
          .andWhere("a.status = :pending", { pending })
          .getMany();
        await Promise.all(
          oldAuthorizations.map((a) => {
            a.status = AuthorizationStatusEnum.Rejected;
            return em.save(a);
          })
        );
        console.log("old authorizations rejected");
      } catch (e) {
        console.log("Error: ", e);
      }
    });
  },
  backupDB: () => {
    //mysqldump -u [database_user] -p[database_pass] --databases [db_name]> ./backup_[date].sql
    const backupFileName = moment().format("DD-MM-YYYY-HH-mm-ss");
    getCurrentEnvironmentalConfig().then(async (params) => {
      await executeCommand(
        "mysqldump",
        [
          `-u ${params.database.user} ${
            params.database.password && params.database.password !== ""
              ? "-p" + params.database.password
              : ""
          } --databases ${params.database.name}> ./${backupFileName}.sql`,
        ],
        params.database.backupDirectory
      );
      console.log("DB backup done");
    });
  },
};

export const scheduleCronJobs = async () => {
  console.log("Scheduling jobs");
  const isActive = true;
  const allCrons = await getManager()
    .createQueryBuilder(Cron, "c")
    .where("c.active = :isActive", { isActive })
    .getMany();
  console.log(allCrons.length, " to schedule");
  allCrons.map((cron) => {
    const job = CronList[cron.name];
    if (job) {
      console.log("scheduling " + cron.name + " on " + cron.expression);
      Scheduler.schedule(cron.expression, job);
    } else {
      console.log(cron.name + "does not exist");
    }
  });
};
