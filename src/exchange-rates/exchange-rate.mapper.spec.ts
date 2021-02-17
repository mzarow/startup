import {expect} from 'chai';
import {ExchangeRateMapper, ExchangeRateMapperImpl} from "./exchange-rate.mapper";
import {ExchangeRateDto} from "./exchange-rate.dto";
import {ExchangeRateCode} from "./exchange-rate-code.enum";
import {ExchangeRate} from "./exchange-rate.model";

describe('Exchange Rate Mapper', () => {
  let exchangeRateMapper: ExchangeRateMapper;

  beforeEach(() => {
    exchangeRateMapper = new ExchangeRateMapperImpl();
  });

  describe('fromDtoToDomain', () => {
    it('should map dto to domain', () => {
      // Arrange
      const exchangeRateDto: ExchangeRateDto = {
        code: ExchangeRateCode.USD,
        bid: 3.52,
        ask: 3.86
      };

      // Act
      const result = exchangeRateMapper.fromDtoToDomain(exchangeRateDto);

      // Assert
      expect(result).to.be.instanceOf(ExchangeRate);
      expect(result.code).to.eq(exchangeRateDto.code);
      expect(result.bid).to.eq(exchangeRateDto.bid.toString());
      expect(result.ask).to.eq(exchangeRateDto.ask.toString());
    });
  });
});
