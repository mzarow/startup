import {Zombie} from "../../../src/zombie/zombie.model";
import {Builder} from "./builder";
import {Item} from "../../../src/items/item.model";


export class ZombieBuilder extends Builder<Zombie> {
  constructor() {
    super(new Zombie());
  }

  public withId(id: number): ZombieBuilder {
    this.entity.id = id;
    return this;
  }

  public withName(name: string): ZombieBuilder {
    this.entity.name = name;
    return this;
  }

  public withItems(items: Item[]): ZombieBuilder {
    this.entity.items = items;
    return this;
  }
}
