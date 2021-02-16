import {IsInt, IsNotEmpty, IsNumber, IsString} from "class-validator";

export class ZombieItemDto {
  @IsInt()
  public id: number;

  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsNumber()
  public price: number;
}
