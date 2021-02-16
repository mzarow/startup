import {Get, Post, JsonController, NotFoundError, Param, Body, Delete, HttpCode, Put} from "routing-controllers";
import {Inject} from "typedi";
import {ZombieService, ZombieServiceImpl} from "./zombie.service";
import {ZombieDto} from "./zombie.dto";
import {ZombieMapper, ZombieMapperImpl} from "./zombie.mapper";
import {Zombie} from "./zombie.model";
import {StatusCodes} from 'http-status-codes';
import {ItemDto} from "../items/item.dto";
import {ItemMapper, ItemMapperImpl} from "../items/item.mapper";

@JsonController('/zombies')
export class ZombieController {

  constructor(
    @Inject(() => ZombieServiceImpl)
    private readonly zombieService: ZombieService,
    @Inject(() => ZombieMapperImpl)
    private readonly zombieMapper: ZombieMapper,
    @Inject(() => ItemMapperImpl)
    private readonly itemMapper: ItemMapper
  ) {}

  @Get()
  public async getAll(): Promise<ZombieDto[]> {
    const zombies = await this.zombieService.listAll();

    return zombies.map((zombie: Zombie) => this.zombieMapper.fromDomainToDto(zombie));
  }

  @Get('/:id')
  public async getOne(@Param('id') id: number): Promise<ZombieDto> {
    const zombie = await this.zombieService.findOne(id);

    if (!zombie) {
      throw new NotFoundError('Zombie not found');
    }

    return this.zombieMapper.fromDomainToDto(zombie);
  }

  @Post()
  @HttpCode(StatusCodes.CREATED)
  public async create(@Body() zombieDto: ZombieDto): Promise<ZombieDto> {
    const zombie = this.zombieMapper.fromDtoToDomain(zombieDto);
    const createdZombie = await this.zombieService.create(zombie);

    return this.zombieMapper.fromDomainToDto(createdZombie);
  }

  @Put('/:id')
  public async update(@Param('id') id: number, @Body() zombieDto: ZombieDto): Promise<ZombieDto> {
    const zombie = this.zombieMapper.fromDtoToDomain(zombieDto);
    const createdZombie = await this.zombieService.update(id, zombie);

    return this.zombieMapper.fromDomainToDto(createdZombie);
  }

  @Delete('/:id')
  public async delete(@Param('id') id: number): Promise<void> {
    await this.zombieService.delete(id);

    return null;
  }

  @Get('/:id/items')
  public async getItems(@Param('id') id: number): Promise<ItemDto[]> {
    const zombie = await this.zombieService.findOne(id, true);

    if (!zombie) {
      throw new NotFoundError('Zombie not found');
    }

    return zombie.items.map(item => this.itemMapper.fromDomainToDto(item));
  }

  @Post('/:id/items')
  public async addItem(@Param('id') id: number, @Body() body: {itemId: number}): Promise<ItemDto[]> {
    const zombie = await this.zombieService.findOne(id, true);

    if (!zombie) {
      throw new NotFoundError('Zombie not found');
    }

    const items = await this.zombieService.addItemToZombie(zombie, body.itemId);

    return items.map(item => this.itemMapper.fromDomainToDto(item));
  }

  @Delete('/:id/items/:itemId')
  public async removeItem(@Param('id') id: number, @Param('itemId') itemId: number): Promise<ItemDto[]> {
    const zombie = await this.zombieService.findOne(id, true);

    if (!zombie) {
      throw new NotFoundError('Zombie not found');
    }

    const items = await this.zombieService.removeItemFromZombie(zombie, itemId);

    return items.map(item => this.itemMapper.fromDomainToDto(item));
  }
}
