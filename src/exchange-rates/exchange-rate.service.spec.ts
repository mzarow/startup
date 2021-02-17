import {expect, use} from 'chai';
import * as sinon from 'sinon';
import {SinonStubbedInstance} from 'sinon';
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from 'chai-as-promised';
import {ExchangeRateCalculator, ExchangeRateCalculatorImpl} from "./exchange-rate.calculator";
import {ExchangeRateService, ExchangeRateServiceImpl, TotalPriceResult} from "./exchange-rate.service";
import {ExchangeRateCode} from "./exchange-rate-code.enum";

use(sinonChai);
use(chaiAsPromised);

describe('Exchange Rate Service', () => {
  let sandbox: sinon.SinonSandbox;
  let exchangeRateCalculator: SinonStubbedInstance<ExchangeRateCalculator>;
  let exchangeRateService: ExchangeRateService;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    exchangeRateCalculator = sandbox.createStubInstance(ExchangeRateCalculatorImpl);
    exchangeRateService = new ExchangeRateServiceImpl(exchangeRateCalculator);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getTotalPriceAllCurrencies', () => {
    it('should get total price for all currencies - bid', async () => {
      // Arrange
      const exchangeRateResult = [{
        code: ExchangeRateCode.USD,
        bid: 400.53123,
        ask: 500.235765
      }];
      const totalPriceResult: TotalPriceResult = {
        code: ExchangeRateCode.USD,
        total: 400.53
      };

      exchangeRateCalculator.calculateAll.resolves(exchangeRateResult);

      // Act
      const result = await expect(exchangeRateService.getTotalPriceAllCurrencies(100, 'bid')).to.eventually.be.fulfilled;

      // Assert
      expect(result).to.be.eql([totalPriceResult]);
    });

    it('should get total price for all currencies - ask', async () => {
      // Arrange
      const exchangeRateResult = [{
        code: ExchangeRateCode.USD,
        bid: 400.53123,
        ask: 500.235765
      }];
      const totalPriceResult: TotalPriceResult = {
        code: ExchangeRateCode.USD,
        total: 500.24
      };

      exchangeRateCalculator.calculateAll.resolves(exchangeRateResult);

      // Act
      const result = await expect(exchangeRateService.getTotalPriceAllCurrencies(100, 'ask')).to.eventually.be.fulfilled;

      // Assert
      expect(result).to.be.eql([totalPriceResult]);
    });
  });
});
