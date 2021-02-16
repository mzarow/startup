import {Service} from "typedi";
import {Zombie} from "./zombie.model";
import {InjectRepository} from "typeorm-typedi-extensions";
import {Repository} from "typeorm";
import {HttpError} from "routing-controllers";
import {StatusCodes} from "http-status-codes";

export interface ZombieService {
  listAll(): Promise<Zombie[]>;
  findOne(id: number): Promise<Zombie>;
  create(zombie: Zombie): Promise<Zombie>;
  update(id: number, zombie: Zombie): Promise<Zombie>;
  delete(id: number): Promise<void>;
}

@Service()
export class ZombieServiceImpl implements ZombieService {

  constructor(
    @InjectRepository(Zombie)
    private readonly zombieRepository: Repository<Zombie>
  ) {}

  public listAll(): Promise<Zombie[]> {
    return this.zombieRepository.find();
  }

  public findOne(id: number): Promise<Zombie> {
    return this.zombieRepository.findOne(id);
  }

  public async create(zombie: Zombie): Promise<Zombie> {
    await this.validateNameUniqueness(zombie.name);

    return this.zombieRepository.save(zombie);
  }

  public async  update(id: number, zombie: Zombie): Promise<Zombie> {
    await this.validateNameUniqueness(zombie.name);

    return this.zombieRepository.save({
      id,
      ...zombie
    });
  }

  public async delete(id: number): Promise<void> {
    await this.zombieRepository.delete(id);
  }

  private async validateNameUniqueness(name: string): Promise<void> {
    const exists = await this.zombieRepository.findOne({name});

    if (exists) {
      throw new HttpError(StatusCodes.CONFLICT, 'Zombie with provided name already exists');
    }
  }
}
