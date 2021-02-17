import {InjectRepository} from "typeorm-typedi-extensions";
import {ExchangeRate} from "./exchange-rate.model";
import {Repository} from "typeorm";
import {ExchangeRateCode} from "./exchange-rate-code.enum";

export interface ExchangeRateCalculator {
  calculateAll(value: number): Promise<ExchangeRateResult[]>;
}

export interface ExchangeRateResult {
  code: ExchangeRateCode
  bid: number;
  ask: number;
}

export class ExchangeRateCalculatorImpl implements ExchangeRateCalculator {

  constructor(
    @InjectRepository(ExchangeRate)
    private readonly exchangeRateRepository: Repository<ExchangeRate>
  ) {}

  public async calculateAll(value: number): Promise<ExchangeRateResult[]> {
    const exchangeRates = await this.exchangeRateRepository.find();
    const exchangeRateResult: ExchangeRateResult[] = [];

    exchangeRates.forEach(exchangeRate => {
      exchangeRateResult.push({
        code: exchangeRate.code,
        bid: value * +exchangeRate.bid,
        ask: value * +exchangeRate.ask
      });
    });

    exchangeRateResult.push({
      code: ExchangeRateCode.PLN,
      bid: value,
      ask: value
    });

    return exchangeRateResult;
  }
}
