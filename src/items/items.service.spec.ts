import {expect, use} from 'chai';
import {ItemBuilder} from "../../test/utils/builders/item.builder";
import {Item} from "./item.model";
import {ItemsService, ItemsServiceImpl} from "./items.service";
import * as sinon from 'sinon';
import {SinonStubbedInstance} from "sinon";
import {Repository} from "typeorm";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from 'chai-as-promised';

use(sinonChai);
use(chaiAsPromised);

describe('Items Service', () => {
  let sandbox: sinon.SinonSandbox;
  let itemsRepositoryStub: SinonStubbedInstance<Repository<Item>>;
  let itemsService: ItemsService;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    itemsRepositoryStub = sandbox.createStubInstance(Repository);
    itemsService = new ItemsServiceImpl(itemsRepositoryStub as any);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('findOne', () => {
    it('should find one item', async () => {
      // Arrange
      const itemId = 5;
      const itemFixture = (new ItemBuilder())
        .withId(itemId)
        .withName('blessed shield')
        .withPrice(999)
        .build();

      itemsRepositoryStub.findOne.resolves(itemFixture);

      // Act
      const result = await expect(itemsService.findOne(itemId)).to.eventually.be.fulfilled;

      // Assert
      expect(result).to.be.eql(itemFixture);
    });
  });
});
