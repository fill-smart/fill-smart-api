import { environmentalConfig } from "../env/env";
import { ScheduledMaintenance } from "../models/system/scheduled-maintenance.model";
import { getConnection } from "typeorm";
import { map } from "rxjs/operators";
let scheduledMaintenances: ScheduledMaintenance[] = [];

export const initializeMaintenanceChecker = () => {
    let scheduler: NodeJS.Timeout;
    environmentalConfig()
        .pipe(
            map(config => config.scheduledMaintenanceCheckInterval * 1000 * 60)
        )
        .subscribe(async interval => {
            if (scheduler) {
                clearInterval(scheduler);
            }
            await loadScheduledMaintenances();
            scheduler = setInterval(
                async () => await loadScheduledMaintenances(),
                interval
            );
        });
};

export const loadScheduledMaintenances = async () => {
    const now = new Date();
    scheduledMaintenances = await getConnection()
        .getRepository(ScheduledMaintenance)
        .createQueryBuilder("m")
        .where("m.to IS NULL or m.to > :now", { now })
        .getMany();
};

export const getScheduledMaintenances = () => scheduledMaintenances;

export interface IMaintenanceInfo {
    from: Date;
    to: Date | null;
    reason: string;
}

export const checkUnderMaintenance = (): IMaintenanceInfo | null => {
    const now = new Date();
    const nextMaintenance = getScheduledMaintenances().find(
        m => now > m.from && ((m.to && now < m.to) || !m.to)
    );
    return nextMaintenance
        ? {
              from: nextMaintenance.from,
              to: nextMaintenance.to,
              reason: nextMaintenance.reason
          }
        : null;
};

export const maintenanceMiddleware = (_: any, res: any, next: any) => {
    const underMaintenance = checkUnderMaintenance();
    if (underMaintenance) {
        return res.status(503).json(underMaintenance);
    } else next();
};
