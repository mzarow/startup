import {Mapper} from "../common/mapper";
import {ItemDto} from "./item.dto";
import {Item} from "./item.model";
import {Service} from "typedi";

export interface ItemMapper extends Mapper<ItemDto, Item> {}

@Service()
export class ItemMapperImpl implements ItemMapper {
  fromDtoToDomain(dto: ItemDto): Item {
    const domain = new Item();
    domain.id = dto.id;
    domain.name = dto.name;
    domain.price = dto.price;

    return domain;
  }

  fromDomainToDto(domain: Item): ItemDto {
    const dto = new ItemDto();
    dto.name = domain.name;
    dto.price = domain.price;

    return dto;
  }
}
