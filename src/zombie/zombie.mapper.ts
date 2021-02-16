import {Mapper} from "../common/mapper";
import {ZombieDto} from "./zombie.dto";
import {Zombie} from "./zombie.model";
import {Service} from "typedi";

export interface ZombieMapper extends Mapper<ZombieDto, Zombie> {}

@Service()
export class ZombieMapperImpl implements ZombieMapper {
  fromDomainToDto(domain: Zombie): ZombieDto {
    const dto = new ZombieDto();
    dto.name = domain.name;
    dto.created = domain.created;

    return dto;
  }

  fromDtoToDomain(dto: ZombieDto): Zombie {
    const domain = new Zombie();
    domain.name = dto.name;

    return domain;
  }
}
