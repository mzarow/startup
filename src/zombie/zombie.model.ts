import {Column, Entity, ManyToMany, JoinTable} from "typeorm";
import {BaseEntity} from "../common/base-entity";
import {Item} from "../items/item.model";

export const TABLE_NAME = 'zombies';

@Entity(TABLE_NAME)
export class Zombie extends BaseEntity {
  public static MAX_ITEMS_COUNT = 5;

  @Column()
  public name: string;

  @ManyToMany(() => Item)
  @JoinTable()
  public items: Item[];
}
