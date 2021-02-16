import {Column, Entity} from "typeorm";
import {BaseEntity} from "../common/base-entity";

export const TABLE_NAME = 'zombies';

@Entity(TABLE_NAME)
export class Zombie extends BaseEntity {
  @Column()
  public name: string;
}
