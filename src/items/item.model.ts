import {BaseEntity} from "../common/base-entity";
import {Column, Entity} from "typeorm";

export const TABLE_NAME = 'items';

@Entity(TABLE_NAME)
export class Item extends BaseEntity {
  @Column()
  public name: string;

  @Column()
  public price: number;
}
