import axios from 'axios';
import * as config from 'nconf';
import {Inject, Service} from "typedi";
import {InjectRepository} from "typeorm-typedi-extensions";
import {Item} from "./item.model";
import {Repository} from "typeorm";
import {ItemDto} from "./item.dto";
import {ItemMapper, ItemMapperImpl} from "./item.mapper";
import {plainToClass} from "class-transformer";

export interface ItemsProcessor {
  processItemsFromExchange(autoRetry: boolean): Promise<void>;
}

export interface ItemsExchangeResult {
  timestamp: number;
  items: Record<string, any>[];
}

@Service()
export class ItemsProcessorImpl implements ItemsProcessor {
  private lastTimestamp: number;

  constructor(
    @Inject(() => ItemMapperImpl)
    private readonly itemMapper: ItemMapper,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>
  ) {}

  public async processItemsFromExchange(autoRetry: boolean): Promise<void> {
    const itemsUrl: string = config.get('api').items;
    let data: ItemsExchangeResult;

    try {
      const response = await axios.get(itemsUrl);
      data = response.data;
    } catch (err) {
      const retryIntervalInMinutes = 5;
      console.error(`Items processor: external API failure ${err.message}`);
      if (autoRetry) {
        this.scheduleProcessing(retryIntervalInMinutes);
      }
      return;
    }

    if (data.items.length === 0 || data.timestamp === this.lastTimestamp) {
      console.log('Items processor: nothing to update');
      return;
    }

    this.lastTimestamp = data.timestamp;

    // dto should be validated over defined decorators after transformation
    const itemsDto: ItemDto[] = data.items.map(item => plainToClass(ItemDto, item));
    const items: Item[] = itemsDto.map(dto => this.itemMapper.fromDtoToDomain(dto));

    await this.itemRepository.save(items);

    console.log('Items processor: items updated');
  }

  private scheduleProcessing(minutes: number): void {
    setTimeout(() => {
      this.processItemsFromExchange(true);
    }, minutes * 1000 * 60);
  }
}
