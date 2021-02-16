import axios from 'axios';
import * as config from 'nconf';
import {Inject, Service} from "typedi";
import {InjectRepository} from "typeorm-typedi-extensions";
import {ZombieItem} from "./zombie-item.model";
import {Repository} from "typeorm";
import {ZombieItemDto} from "./zombie-item.dto";
import {ZombieItemTransformer, ZombieItemTransformerImpl} from "./zombie-item.transformer";
import {ZombieItemMapper, ZombieItemMapperImpl} from "./zombie-item.mapper";

export interface ZombieItemsProcessor {
  processItemsFromExchange(): Promise<void>;
}

export interface ZombieItemsExchangeResult {
  timestamp: number;
  items: Record<string, any>[];
}

@Service()
export class ZombieItemsProcessorImpl implements ZombieItemsProcessor {
  private lastTimestamp: number;

  constructor(
    @Inject(() => ZombieItemTransformerImpl)
    private readonly zombieItemTransformer: ZombieItemTransformer,
    @Inject(() => ZombieItemMapperImpl)
    private readonly zombieItemMapper: ZombieItemMapper,
    @InjectRepository(ZombieItem)
    private readonly zombieItemRepository: Repository<ZombieItem>
  ) {}

  public async processItemsFromExchange(): Promise<void> {
    const zombieItemsUrl: string = config.get('api').zombieItems;
    let data: ZombieItemsExchangeResult;

    try {
      const response = await axios.get(zombieItemsUrl);
      data = response.data;
    } catch (err) {
      const retryIntervalInMinutes = 5;
      console.error(`Items processor: external API failure ${err.message}. Retrying in ${retryIntervalInMinutes} minutes.`);
      this.scheduleProcessing(retryIntervalInMinutes);
      return;
    }

    if (data.items.length === 0 || data.timestamp === this.lastTimestamp) {
      console.log('Items processor: nothing to update');
      return;
    }

    this.lastTimestamp = data.timestamp;

    const zombieItemsDto: ZombieItemDto[] = data.items.map(item => this.zombieItemTransformer.toZombieItemDto(item));
    const zombieItems: ZombieItem[] = zombieItemsDto.map(dto => this.zombieItemMapper.fromDtoToDomain(dto));

    await this.zombieItemRepository.save(zombieItems);

    console.log('Items processor: items updated');
  }

  private scheduleProcessing(minutes: number): void {
    setTimeout(() => {
      this.processItemsFromExchange();
    }, minutes * 1000 * 60);
  }
}
