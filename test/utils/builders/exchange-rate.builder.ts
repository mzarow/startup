import {Builder} from "./builder";
import {ExchangeRate} from "../../../src/exchange-rates/exchange-rate.model";
import {ExchangeRateCode} from "../../../src/exchange-rates/exchange-rate-code.enum";

export class ExchangeRateBuilder extends Builder<ExchangeRate> {
  constructor() {
    super(new ExchangeRate());
  }

  public withCode(code: ExchangeRateCode): ExchangeRateBuilder {
    this.entity.code = code;
    return this;
  }

  public withBid(bid: string): ExchangeRateBuilder {
    this.entity.bid = bid;
    return this;
  }

  public withAsk(ask: string): ExchangeRateBuilder {
    this.entity.ask = ask;
    return this;
  }
}
