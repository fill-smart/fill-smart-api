import {
  getConnection,
  PrimaryGeneratedColumn,
  Column,
  BeforeUpdate,
  getManager,
  EntityManager,
} from "typeorm";
export class BaseModel {
  @PrimaryGeneratedColumn()
  id: number | string = 0;

  @Column("datetime")
  created: Date = new Date();

  @Column("datetime", { nullable: true })
  updated: Date | null = null;

  @BeforeUpdate()
  setUpdated() {
    this.updated = new Date();
  }

  @Column("boolean", { default: false })
  deleted: boolean = false;

  public static getRelations(): IRelationDefinition[] {
    return getConnection()
      .getMetadata(this)
      .relations.map((r) => ({
        name: r.propertyName,
        model: <typeof BaseModel>r.type,
      }));
  }

  public static async create(entity: Partial<BaseModel>): Promise<BaseModel> {
    const inserted = await getConnection().manager.save(entity);
    return <BaseModel>inserted;
  }

  public static async update(
    id: number,
    entity: Partial<BaseModel>
  ): Promise<BaseModel> {
    await getConnection()
      .createQueryBuilder()
      .update(this)
      .set(entity)
      .where("id = :id", { id })
      .execute();
    return <BaseModel>(
      await getConnection()
        .getRepository(this)
        .createQueryBuilder("e")
        .where("e.id = :id", { id })
        .getOne()
    );
  }

  public static async delete(id: number, em?: EntityManager): Promise<void> {
    await await (em ?? getManager())
      .createQueryBuilder()
      .update(this)
      .set({ deleted: true })
      .where("id = :id", { id })
      .execute();
  }

  public static async getById(id: number, em?: EntityManager) {
    return await (em ?? getManager())
      .getRepository(this)
      .createQueryBuilder("e")
      .where("e.id = :id", { id })
      .getOne();
  }
}

export interface IRelationDefinition {
  name: string;
  model: typeof BaseModel;
}
