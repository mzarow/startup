import {expect, use} from 'chai';
import {ItemBuilder} from "../../test/utils/builders/item.builder";
import {Item} from "./item.model";
import * as sinon from 'sinon';
import {SinonStubbedInstance} from "sinon";
import {Repository} from "typeorm";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from 'chai-as-promised';
import {ItemMapper, ItemMapperImpl} from "./item.mapper";
import {ItemsExchangeResult, ItemsProcessor, ItemsProcessorImpl} from "./items.processor";
import * as config from 'nconf';
import axios from 'axios';
import {ItemDto} from "./item.dto";
import {plainToClass} from "class-transformer";

use(sinonChai);
use(chaiAsPromised);

describe('Items Processor', () => {
  let sandbox: sinon.SinonSandbox;
  let itemMapperStub :SinonStubbedInstance<ItemMapper>;
  let itemRepositoryStub: SinonStubbedInstance<Repository<Item>>;
  let itemsProcessor: ItemsProcessor;

  const apiConfig = {
    items: 'http://localhost/items'
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    itemMapperStub = sandbox.createStubInstance(ItemMapperImpl);
    itemRepositoryStub = sandbox.createStubInstance(Repository);
    itemsProcessor = new ItemsProcessorImpl(
      itemMapperStub,
      itemRepositoryStub as any
    );

    sandbox.stub(config, 'get').withArgs('api').returns(apiConfig);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('processItemsFromExchange', () => {
    it('should process items from external api', async() => {
      // Arrange
      const itemDtoFixture: ItemDto = {
        id: 1,
        name: 'flaming armor',
        price: 1500
      };
      const itemFixture = (new ItemBuilder())
        .withId(itemDtoFixture.id)
        .withName(itemDtoFixture.name)
        .withPrice(itemDtoFixture.price)
        .build();
      const apiResponse: ItemsExchangeResult = {
        timestamp: Date.now(),
        items: [itemDtoFixture]
      };

      const axiosGet = sandbox.stub(axios, 'get').resolves({data: apiResponse});
      itemMapperStub.fromDtoToDomain.returns(itemFixture);

      // Act
      await expect(itemsProcessor.processItemsFromExchange(false)).to.eventually.be.fulfilled;

      // Assert
      expect(axiosGet).to.have.been.calledOnceWith(apiConfig.items);
      expect(itemMapperStub.fromDtoToDomain).to.have.been.calledOnceWith(plainToClass(ItemDto, itemDtoFixture));
      expect(itemRepositoryStub.save).to.have.been.calledOnceWith([itemFixture]);
    });

    it('should not process/save items if request to api fails', async() => {
      // Arrange
      sandbox.stub(axios, 'get').rejects();

      // Act
      await expect(itemsProcessor.processItemsFromExchange(false)).to.eventually.be.fulfilled;

      // Assert
      expect(itemMapperStub.fromDtoToDomain).to.not.have.been.called;
      expect(itemRepositoryStub.save).to.not.have.been.called;
    });

    it('should not process/save items if no items', async() => {
      // Arrange
      const apiResponse: ItemsExchangeResult = {
        timestamp: Date.now(),
        items: []
      };
      sandbox.stub(axios, 'get').resolves({data: apiResponse});

      // Act
      await expect(itemsProcessor.processItemsFromExchange(false)).to.eventually.be.fulfilled;

      // Assert
      expect(itemMapperStub.fromDtoToDomain).to.not.have.been.called;
      expect(itemRepositoryStub.save).to.not.have.been.called;
    });
  });
});
