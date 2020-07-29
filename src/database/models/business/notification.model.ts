import { Customer } from "./customer.model";

import { Entity, Column, ManyToOne, OneToMany } from "typeorm";
import { BaseModel } from "./../../../core/models/base.model";

@Entity()
export class Notification extends BaseModel {
  @Column("varchar")
  title: string = "";

  @Column("text")
  text: string = "";
}
