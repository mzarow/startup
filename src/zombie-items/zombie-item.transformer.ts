import {ZombieItemDto} from "./zombie-item.dto";
import {plainToClass} from "class-transformer";
import {Service} from "typedi";

export interface ZombieItemTransformer {
  toZombieItemDto(object: Record<string, string>): ZombieItemDto;
}

@Service()
export class ZombieItemTransformerImpl implements ZombieItemTransformer {

  public toZombieItemDto(object: Record<string, any>): ZombieItemDto {
    // dto should be validated through defined decorators before return
    return plainToClass(ZombieItemDto, object);
  }
}
