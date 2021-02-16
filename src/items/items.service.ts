import {Item} from "./item.model";
import {InjectRepository} from "typeorm-typedi-extensions";
import {Repository} from "typeorm";

export interface ItemsService {
  findOne(id: number): Promise<Item>;
}

export class ItemsServiceImpl implements ItemsService {

  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>
  ) {}

  findOne(id: number): Promise<Item> {
    return this.itemRepository.findOne(id);
  }
}
