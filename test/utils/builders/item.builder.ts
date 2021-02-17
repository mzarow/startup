import {Builder} from "./builder";
import {Item} from "../../../src/items/item.model";


export class ItemBuilder extends Builder<Item> {
  constructor() {
    super(new Item());
  }

  public withId(id: number): ItemBuilder {
    this.entity.id = id;
    return this;
  }

  public withName(name: string): ItemBuilder {
    this.entity.name = name;
    return this;
  }

  public withPrice(price: number): ItemBuilder {
    this.entity.price = price;
    return this;
  }
}
