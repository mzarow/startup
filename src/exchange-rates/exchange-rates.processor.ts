import * as config from "nconf";
import axios from "axios";
import {Inject, Service} from "typedi";
import {plainToClass} from "class-transformer";
import {ExchangeRateDto} from "./exchange-rate.dto";
import {ExchangeRate} from "./exchange-rate.model";
import {ExchangeRateMapper, ExchangeRateMapperImpl} from "./exchange-rate.mapper";
import {InjectRepository} from "typeorm-typedi-extensions";
import {Repository} from "typeorm";
import {ExchangeRateCode} from "./exchange-rate-code.enum";


export interface ExchangeRatesProcessor {
  processExchangeRates(autoRetry: boolean): Promise<void>;
}

export interface ExchangeRateResult {
  tradingDate: string;
  rates: Record<string, any>[];
}

@Service()
export class ExchangeRatesProcessorImpl implements ExchangeRatesProcessor {
  private lastTradingDate: string;

  constructor(
    @Inject(() => ExchangeRateMapperImpl)
    private readonly exchangeRateMapper: ExchangeRateMapper,
    @InjectRepository(ExchangeRate)
    private readonly exchangeRateRepository: Repository<ExchangeRate>
  ) {}


  public async processExchangeRates(autoRetry: boolean): Promise<void> {
    const itemsUrl: string = config.get('api').exchangeRates;
    let data: ExchangeRateResult;

    try {
      const response = await axios.get(itemsUrl);

      data = response.data[0];
    } catch (err) {
      console.error(`Items processor: external API failure ${err.message}`);
      if (autoRetry) {
        const retryIntervalInMinutes = 5;
        this.scheduleProcessing(retryIntervalInMinutes);
      }
      return;
    }

    if (!data || !data.rates || !data.rates.length || data.tradingDate === this.lastTradingDate) {
      console.log('Exchange rate processor: nothing to update');
      return;
    }

    this.lastTradingDate = data.tradingDate;

    const supportedCurrenciesCodes = Object.values(ExchangeRateCode);
    const filteredRates = data.rates.filter(rate => supportedCurrenciesCodes.find(code => code === rate.code));

    // dto should be validated over defined decorators after transformation
    const exchangeRatesDto: ExchangeRateDto[] = filteredRates.map(rate => plainToClass(ExchangeRateDto, rate));
    const exchangeRates: ExchangeRate[] = exchangeRatesDto.map(dto => this.exchangeRateMapper.fromDtoToDomain(dto));

    await this.exchangeRateRepository.save(exchangeRates);

    console.log('Exchange rate processor: rates updated');
  }

  private scheduleProcessing(minutes: number): void {
    setTimeout(() => {
      this.processExchangeRates(true);
    }, minutes * 1000 * 60);
  }
}
