import {expect, use} from 'chai';
import * as sinon from 'sinon';
import {SinonStubbedInstance} from 'sinon';
import {Repository} from "typeorm";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from 'chai-as-promised';
import * as config from 'nconf';
import axios from 'axios';
import {plainToClass} from "class-transformer";
import {ExchangeRateMapper, ExchangeRateMapperImpl} from "./exchange-rate.mapper";
import {ExchangeRate} from "./exchange-rate.model";
import {ExchangeRateResult, ExchangeRatesProcessor, ExchangeRatesProcessorImpl} from "./exchange-rates.processor";
import {ExchangeRateDto} from "./exchange-rate.dto";
import {ExchangeRateCode} from "./exchange-rate-code.enum";
import {ExchangeRateBuilder} from "../../test/utils/builders/exchange-rate.builder";

use(sinonChai);
use(chaiAsPromised);

describe('Exchange Rates Processor', () => {
  let sandbox: sinon.SinonSandbox;
  let exchangeRateMapperStub :SinonStubbedInstance<ExchangeRateMapper>;
  let exchangeRateRepository: SinonStubbedInstance<Repository<ExchangeRate>>;
  let exchangeRatesProcessor: ExchangeRatesProcessor;

  const apiConfig = {
    exchangeRates: 'http://localhost/rates'
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    exchangeRateMapperStub = sandbox.createStubInstance(ExchangeRateMapperImpl);
    exchangeRateRepository = sandbox.createStubInstance(Repository);
    exchangeRatesProcessor = new ExchangeRatesProcessorImpl(
      exchangeRateMapperStub,
      exchangeRateRepository as any
    );

    sandbox.stub(config, 'get').withArgs('api').returns(apiConfig);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('processExchangeRates', () => {
    it('should process rates from external api', async() => {
      // Arrange
      const exchangeRateDtoFixture: ExchangeRateDto = {
        code: ExchangeRateCode.USD,
        ask: 4.123,
        bid: 4.643
      };
      const exchangeRateFixture = (new ExchangeRateBuilder())
        .withCode(exchangeRateDtoFixture.code)
        .withAsk(exchangeRateDtoFixture.ask.toString())
        .withBid(exchangeRateDtoFixture.bid.toString())
        .build();
      const apiResponse: ExchangeRateResult = {
        tradingDate: '2021-02-16',
        rates: [exchangeRateDtoFixture]
      };

      const axiosGet = sandbox.stub(axios, 'get').resolves({data: [apiResponse]});

      exchangeRateMapperStub.fromDtoToDomain.returns(exchangeRateFixture);

      // Act
      await expect(exchangeRatesProcessor.processExchangeRates(false)).to.eventually.be.fulfilled;

      // Assert
      expect(axiosGet).to.have.been.calledOnceWith(apiConfig.exchangeRates);
      expect(exchangeRateMapperStub.fromDtoToDomain)
        .to.have.been.calledOnceWith(plainToClass(ExchangeRateDto, exchangeRateDtoFixture));
      expect(exchangeRateRepository.clear).to.have.been.calledOnce;
      expect(exchangeRateRepository.save).to.have.been.calledOnceWith([exchangeRateFixture]);
    });

    it('should not process/save items if request to api fails', async() => {
      // Arrange
      sandbox.stub(axios, 'get').rejects();

      // Act
      await expect(exchangeRatesProcessor.processExchangeRates(false)).to.eventually.be.fulfilled;

      // Assert
      expect(exchangeRateMapperStub.fromDtoToDomain).to.not.have.been.called;
      expect(exchangeRateRepository.clear).to.not.have.been.called;
      expect(exchangeRateRepository.save).to.not.have.been.called;
    });

    it('should not process/save items if no items', async() => {
      // Arrange
      const apiResponse: ExchangeRateResult = {
        tradingDate: '2021-02-16',
        rates: []
      };

      sandbox.stub(axios, 'get').resolves({data: [apiResponse]});

      // Act
      await expect(exchangeRatesProcessor.processExchangeRates(false)).to.eventually.be.fulfilled;

      // Assert
      expect(exchangeRateMapperStub.fromDtoToDomain).to.not.have.been.called;
      expect(exchangeRateRepository.clear).to.not.have.been.called;
      expect(exchangeRateRepository.save).to.not.have.been.called;
    });
  });
});
