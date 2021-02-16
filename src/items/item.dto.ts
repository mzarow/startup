import {IsInt, IsNotEmpty, IsNumber, IsString} from "class-validator";

export class ItemDto {
  @IsInt()
  public id: number;

  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsNumber()
  public price: number;
}
