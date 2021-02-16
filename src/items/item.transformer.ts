import {ItemDto} from "./item.dto";
import {plainToClass} from "class-transformer";
import {Service} from "typedi";

export interface ItemTransformer {
  toItemDto(object: Record<string, string>): ItemDto;
}

@Service()
export class ItemTransformerImpl implements ItemTransformer {

  public toItemDto(object: Record<string, any>): ItemDto {
    // dto should be validated through defined decorators before return
    return plainToClass(ItemDto, object);
  }
}
