import fs from "fs";
export const copyFile = (from: string, to: string) => {
    return fs.createReadStream(from).pipe(fs.createWriteStream(to));
};
