import {FromDtoToDomain} from "../common/mapper";
import {ZombieItemDto} from "./zombie-item.dto";
import {ZombieItem} from "./zombie-item.model";
import {Service} from "typedi";

export interface ZombieItemMapper extends FromDtoToDomain<ZombieItemDto, ZombieItem> {}

@Service()
export class ZombieItemMapperImpl implements ZombieItemMapper {
  fromDtoToDomain(dto: ZombieItemDto): ZombieItem {
    const domain = new ZombieItem();
    domain.id = dto.id;
    domain.name = dto.name;
    domain.price = dto.price;

    return domain;
  }
}
