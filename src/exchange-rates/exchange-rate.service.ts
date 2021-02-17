import {Inject} from "typedi";
import {ExchangeRateCalculator, ExchangeRateCalculatorImpl} from "./exchange-rate.calculator";
import {ExchangeRateCode} from "./exchange-rate-code.enum";

export type ExchangeType = 'bid' | 'ask';

export interface ExchangeRateService {
  getTotalPriceAllCurrencies(pricePLN: number, type?: ExchangeType): Promise<TotalPriceResult[]>;
}

export interface TotalPriceResult {
  code: ExchangeRateCode;
  total: number;
}

export class ExchangeRateServiceImpl implements ExchangeRateService {

  constructor(
    @Inject(() => ExchangeRateCalculatorImpl)
    private readonly exchangeRateCalculator: ExchangeRateCalculator
  ) {}

  public async getTotalPriceAllCurrencies(pricePLN: number, type: ExchangeType = 'bid'): Promise<TotalPriceResult[]> {
    const exchangeResult = await this.exchangeRateCalculator.calculateAll(pricePLN);

    return exchangeResult.map(exchange => {
      const total = type === 'bid' ? exchange.bid : exchange.ask;

      return {
        code: exchange.code,
        total: Math.round( total * 1e2 ) / 1e2
      };
    });
  }
}
