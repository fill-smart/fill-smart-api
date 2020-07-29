import { Document } from "./document.model";
import { Entity, OneToOne, JoinColumn, getConnection } from "typeorm";
import { BaseModel } from "./../../../core/models/base.model";
import Jimp from "jimp";
import fs from "fs";

@Entity()
export class Image extends BaseModel {
    @OneToOne(_ => Document, "image")
    @JoinColumn()
    document?: Promise<Document>;

    get base64(): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                fs.readFile(
                    `${__dirname}/../../../uploads/documents/${this.id}.jpg`,
                    (err, data) => {
                        try {
                            if (err) resolve("");
                            resolve(Buffer.from(data).toString("base64"));
                        }
                        catch (error) {
                            resolve("");
                        }
                    }
                );
            }
            catch (error) {
                return resolve("");
            }
        });
    }

    public static async createAndStore(
        entity: Image,
        base64: string,
        rotation: number = 0
    ): Promise<Image> {
        return new Promise(async (resolve, reject) => {
            await getConnection().transaction(async em => {
                try {
                    const inserted = await em.save(entity);
                    (await Jimp.read(Buffer.from(base64, "base64")))
                        .rotate(rotation * -1)
                        .quality(60)
                        .write(
                            `${__dirname}/../../../uploads/documents/${inserted.id}.jpg`
                        );
                    return resolve(inserted);
                } catch (e) {
                    return reject(e);
                }
            });
        });
    }
}
