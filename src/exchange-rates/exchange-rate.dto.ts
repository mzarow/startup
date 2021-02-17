import {IsNumber, IsString} from "class-validator";
import {ExchangeRateCode} from "./exchange-rate-code.enum";

export class ExchangeRateDto {
  @IsString()
  public code: ExchangeRateCode;

  @IsNumber()
  public bid: number;

  @IsNumber()
  public ask: number;
}
