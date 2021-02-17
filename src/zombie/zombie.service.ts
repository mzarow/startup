import {Inject, Service} from "typedi";
import {Zombie} from "./zombie.model";
import {InjectRepository} from "typeorm-typedi-extensions";
import {Repository} from "typeorm";
import {HttpError, NotFoundError} from "routing-controllers";
import {StatusCodes} from "http-status-codes";
import {Item} from "../items/item.model";
import {ItemsService, ItemsServiceImpl} from "../items/items.service";
import {ExchangeRateService, ExchangeRateServiceImpl, TotalPriceResult} from "../exchange-rates/exchange-rate.service";

export interface ZombieService {
  listAll(): Promise<Zombie[]>;
  findOne(id: number, withItems?: boolean): Promise<Zombie>;
  create(zombie: Zombie): Promise<Zombie>;
  update(id: number, zombie: Zombie): Promise<Zombie>;
  delete(id: number): Promise<void>;
  addItemToZombie(zombie: Zombie, itemId: number): Promise<Item[]>;
  removeItemFromZombie(zombie: Zombie, itemId: number): Promise<Item[]>;
  getTotalItemsPriceForZombie(zombie: Zombie): Promise<TotalPriceResult[]>;
}

@Service()
export class ZombieServiceImpl implements ZombieService {

  constructor(
    @InjectRepository(Zombie)
    private readonly zombieRepository: Repository<Zombie>,
    @Inject(() => ItemsServiceImpl)
    private readonly itemsService: ItemsService,
    @Inject(() => ExchangeRateServiceImpl)
    private readonly exchangeRateService: ExchangeRateService,
  ) {}

  public listAll(): Promise<Zombie[]> {
    return this.zombieRepository.find();
  }

  public findOne(id: number, withItems: boolean = false): Promise<Zombie> {
    return this.zombieRepository.findOne(id, withItems ? {relations: ['items']} : {});
  }

  public async create(zombie: Zombie): Promise<Zombie> {
    await this.validateNameUniqueness(zombie.name);

    return this.zombieRepository.save(zombie);
  }

  public async update(id: number, zombie: Zombie): Promise<Zombie> {
    await this.validateNameUniqueness(zombie.name);

    zombie.id = id;

    return this.zombieRepository.save(zombie);
  }

  public async delete(id: number): Promise<void> {
    await this.zombieRepository.delete(id);
  }

  public async addItemToZombie(zombie: Zombie, itemId: number): Promise<Item[]> {
    const item = await this.itemsService.findOne(itemId);

    if (!item) {
      throw new NotFoundError('Specified item does not exist');
    }

    if (zombie.items.length >= Zombie.MAX_ITEMS_COUNT) {
      throw new HttpError(StatusCodes.CONFLICT, 'Cannot add item - limit exceeded');
    }

    const isItemAlreadyAssigned: boolean = !!(zombie.items.find(item => item.id === itemId));

    if (isItemAlreadyAssigned) {
      throw new HttpError(StatusCodes.CONFLICT, 'Item is already assigned');
    }

    zombie.items.push(item);

    const savedZombie = await this.zombieRepository.save(zombie);

    return savedZombie.items;
  }

  public async removeItemFromZombie(zombie: Zombie, itemId: number): Promise<Item[]> {
    const isAlreadyRemoved: boolean = !(zombie.items.find(item => item.id === itemId));

    if (isAlreadyRemoved) {
      throw new HttpError(StatusCodes.CONFLICT, 'Item is already removed');
    }

    zombie.items = zombie.items.filter(item => item.id !== itemId);

    const savedZombie = await this.zombieRepository.save(zombie);

    return savedZombie.items;
  }

  public async getTotalItemsPriceForZombie(zombie: Zombie): Promise<TotalPriceResult[]> {
    const totalPriceInPLN: number = zombie.items.reduce((acc, curr) => {
      return acc + curr.price;
    }, 0);

    return this.exchangeRateService.getTotalPriceAllCurrencies(totalPriceInPLN);
  }

  private async validateNameUniqueness(name: string): Promise<void> {
    const exists = await this.zombieRepository.findOne({name});

    if (exists) {
      throw new HttpError(StatusCodes.CONFLICT, 'Zombie with provided name already exists');
    }
  }
}
