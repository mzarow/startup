import {FromDtoToDomain} from "../common/mapper";
import {Service} from "typedi";
import {ExchangeRateDto} from "./exchange-rate.dto";
import {ExchangeRate} from "./exchange-rate.model";

export interface ExchangeRateMapper extends FromDtoToDomain<ExchangeRateDto, ExchangeRate> {}

@Service()
export class ExchangeRateMapperImpl implements ExchangeRateMapper {
  fromDtoToDomain(dto: ExchangeRateDto): ExchangeRate {
    const domain = new ExchangeRate();
    domain.code = dto.code;
    domain.bid = dto.bid.toString();
    domain.ask = dto.ask.toString();

    return domain;
  }
}
