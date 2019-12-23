import { exec } from "child_process";

export const getAPIInfo = async (): Promise<IAPIInfo> => ({
    hash: await getAPIHash(),
    version: await getAPIVersion()
});

export const getAPIHash = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        exec("git rev-parse HEAD", (err: any, stdout: string) => {
            if (err) {
                reject(err);
            }
            resolve(stdout.replace("\n", ""));
        });
    });
};

export const getAPIVersion = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        exec("git describe --abbrev=0 --tags", (err: any, stdout: string) => {
            if (err) {
                reject(err);
            }
            resolve(stdout.replace("\n", ""));
        });
    });
};

export interface IAPIInfo {
    version: string;
    hash: string;
}
