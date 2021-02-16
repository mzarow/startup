import {BaseEntity} from "../common/base-entity";
import {Column, Entity} from "typeorm";

export const TABLE_NAME = 'zombie_items';

@Entity(TABLE_NAME)
export class ZombieItem extends BaseEntity {
  @Column()
  public name: string;

  @Column()
  public price: number;
}
