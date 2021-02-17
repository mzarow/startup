import {expect, use} from 'chai';
import {ZombieBuilder} from "../../test/utils/builders/zombie.builder";
import {Zombie} from "./zombie.model";
import {SinonSandbox, SinonStubbedInstance} from "sinon";
import {Repository} from "typeorm";
import {ItemsService, ItemsServiceImpl} from "../items/items.service";
import {ExchangeRateService, ExchangeRateServiceImpl} from "../exchange-rates/exchange-rate.service";
import {ZombieService, ZombieServiceImpl} from "./zombie.service";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from 'chai-as-promised';
import {ItemBuilder} from "../../test/utils/builders/item.builder";
import {HttpError, NotFoundError} from "routing-controllers";
import {ExchangeRateCode} from "../exchange-rates/exchange-rate-code.enum";

use(sinonChai);
use(chaiAsPromised);

describe('Zombie Service', () => {
  let sandbox: SinonSandbox;
  let zombieRepositoryStub: SinonStubbedInstance<Repository<Zombie>>;
  let itemsServiceStub: SinonStubbedInstance<ItemsService>;
  let exchangeRateServiceStub: SinonStubbedInstance<ExchangeRateService>;
  let zombieService: ZombieService;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    zombieRepositoryStub = sandbox.createStubInstance(Repository);
    itemsServiceStub = sandbox.createStubInstance(ItemsServiceImpl);
    exchangeRateServiceStub = sandbox.createStubInstance(ExchangeRateServiceImpl);
    zombieService = new ZombieServiceImpl(
      zombieRepositoryStub as any,
      itemsServiceStub,
      exchangeRateServiceStub
    );
  });

  describe('listAll', () => {
    it('should list all zombies', async () => {
      // Arrange
      const zombieFixture = (new ZombieBuilder())
        .withId(1)
        .withName('zombie')
        .build();
      const findResult = [zombieFixture];

      zombieRepositoryStub.find.resolves(findResult);

      // Act
      const result = await expect(zombieService.listAll()).to.eventually.be.fulfilled;

      // Assert
      expect(zombieRepositoryStub.find).to.have.been.calledOnce;
      expect(result.length).to.eq(findResult.length);
      expect(result[0]).to.be.eql(zombieFixture);
    });
  });

  describe('findOne', () => {
    it('should find one zombie', async () => {
      // Arrange
      const zombieId = 1;
      const zombieFixture = (new ZombieBuilder())
        .withId(zombieId)
        .withName('zombie')
        .build();

      zombieRepositoryStub.findOne.resolves(zombieFixture);

      // Act
      const result = await expect(zombieService.findOne(zombieId)).to.eventually.be.fulfilled;

      // Assert
      expect(zombieRepositoryStub.findOne).to.have.been.calledOnceWith(zombieId, {});
      expect(result).to.be.eql(zombieFixture);
    });

    it('should find one zombie with items', async () => {
      // Arrange
      const itemFixture = (new ItemBuilder())
        .withId(2)
        .withName('magic longsword')
        .build();
      const zombieId = 1;
      const zombieFixture = (new ZombieBuilder())
        .withId(zombieId)
        .withName('zombie')
        .withItems([itemFixture])
        .build();
      const withItems = true;

      zombieRepositoryStub.findOne.resolves(zombieFixture);

      // Act
      const result = await expect(zombieService.findOne(zombieId, withItems)).to.eventually.be.fulfilled;

      // Assert
      expect(zombieRepositoryStub.findOne).to.have.been.calledOnceWith(zombieId, {relations: ['items']});
      expect(result).to.be.eql(zombieFixture);
    });
  });

  describe('create', () => {
    it('should create zombie', async () => {
      // Arrange
      const zombieFixture = (new ZombieBuilder())
        .withId(5)
        .withName('zombie')
        .build();

      zombieRepositoryStub.findOne.resolves(undefined);
      zombieRepositoryStub.save.resolves(zombieFixture);

      // Act
      const result = await expect(zombieService.create(zombieFixture)).to.eventually.be.fulfilled;

      // Assert
      expect(zombieRepositoryStub.findOne).to.have.been.calledOnceWith({name: zombieFixture.name});
      expect(zombieRepositoryStub.save).to.have.been.calledOnceWith(zombieFixture);
      expect(result).to.be.eql(zombieFixture);
    });

    it('should throw if zombie with same name already exists', async () => {
      // Arrange
      const zombieFixture = (new ZombieBuilder())
        .withId(5)
        .withName('zombie')
        .build();

      zombieRepositoryStub.findOne.resolves(zombieFixture);

      // Act
      await expect(zombieService.create(zombieFixture)).to.eventually.be.rejectedWith(
        HttpError,
        'Zombie with provided name already exists'
      );

      // Assert
      expect(zombieRepositoryStub.findOne).to.have.been.calledOnceWith({name: zombieFixture.name});
      expect(zombieRepositoryStub.save).to.not.have.been.called;
    });
  });

  describe('update', () => {
    it('should update zombie', async () => {
      // Arrange
      const zombieId = 10;
      const zombieFixture = (new ZombieBuilder())
        .withId(zombieId)
        .withName('zombie')
        .build();

      zombieRepositoryStub.findOne.resolves(undefined);
      zombieRepositoryStub.save.resolves(zombieFixture);

      // Act
      const result = await expect(zombieService.update(zombieId, zombieFixture)).to.eventually.be.fulfilled;

      // Assert
      expect(zombieRepositoryStub.findOne).to.have.been.calledOnceWith({name: zombieFixture.name});
      expect(zombieRepositoryStub.save).to.have.been.calledOnceWith(zombieFixture);
      expect(result).to.be.eql(zombieFixture);
    });

    it('should throw if zombie with same name already exists', async () => {
      // Arrange
      const zombieId = 7;
      const zombieFixture = (new ZombieBuilder())
        .withId(zombieId)
        .withName('zombie')
        .build();

      zombieRepositoryStub.findOne.resolves(zombieFixture);

      // Act
      await expect(zombieService.update(zombieId, zombieFixture)).to.eventually.be.rejectedWith(
        HttpError,
        'Zombie with provided name already exists'
      );

      // Assert
      expect(zombieRepositoryStub.findOne).to.have.been.calledOnceWith({name: zombieFixture.name});
      expect(zombieRepositoryStub.save).to.not.have.been.called;
    });
  });

  describe('delete', () => {
    it('should delete zombie', async () => {
      // Arrange
      const zombieId = 10;

      // Act
      await expect(zombieService.delete(zombieId)).to.eventually.be.fulfilled;

      // Assert
      expect(zombieRepositoryStub.delete).to.have.been.calledOnceWith(zombieId);
    });
  });

  describe('addItemToZombie', () => {
    it('should add item to zombie', async () => {
      // Arrange
      const zombieId = 10;
      const zombieFixture = (new ZombieBuilder())
        .withId(zombieId)
        .withName('zombie')
        .withItems([])
        .build();
      const itemFixture = (new ItemBuilder())
        .withId(5)
        .withName('golden helmet')
        .build();

      itemsServiceStub.findOne.resolves(itemFixture);
      zombieRepositoryStub.save.resolves(zombieFixture);

      // Act
      const result = await expect(zombieService.addItemToZombie(zombieFixture, itemFixture.id)).to.eventually.be.fulfilled;

      // Assert
      expect(itemsServiceStub.findOne).to.have.been.calledOnceWith(itemFixture.id);
      expect(zombieRepositoryStub.save).to.have.been.calledOnceWith(zombieFixture);
      expect(zombieFixture.items.length).to.eq(1);
      expect(zombieFixture.items[0]).to.be.eql(itemFixture);
      expect(result).to.be.eql([itemFixture]);
    });

    it('should throw if item does not exist', async () => {
      // Arrange
      const itemId = 1;
      const zombieId = 10;
      const zombieFixture = (new ZombieBuilder())
        .withId(zombieId)
        .withName('zombie')
        .withItems([])
        .build();

      itemsServiceStub.findOne.resolves(undefined);

      // Act
      await expect(zombieService.addItemToZombie(zombieFixture, itemId)).to.eventually.be.rejectedWith(
        NotFoundError,
        'Specified item does not exist'
      );

      // Assert
      expect(itemsServiceStub.findOne).to.have.been.calledOnceWith(itemId);
      expect(zombieRepositoryStub.save).to.not.have.been.called;
    });

    it('should throw if max zombie items count achieved', async () => {
      // Arrange
      const itemId = 1;
      const itemFixture = (new ItemBuilder())
        .withId(5)
        .withName('plate armor')
        .build();
      const zombieId = 10;
      const zombieFixture = (new ZombieBuilder())
        .withId(zombieId)
        .withName('zombie')
        .withItems([
          itemFixture,
          itemFixture,
          itemFixture,
          itemFixture,
          itemFixture
        ])
        .build();

      itemsServiceStub.findOne.resolves(itemFixture);

      // Act
      await expect(zombieService.addItemToZombie(zombieFixture, itemId)).to.eventually.be.rejectedWith(
        HttpError,
        'Cannot add item - limit exceeded'
      );

      // Assert
      expect(itemsServiceStub.findOne).to.have.been.calledOnceWith(itemId);
      expect(zombieRepositoryStub.save).to.not.have.been.called;
    });

    it('should throw if item already assigned', async () => {
      // Arrange
      const itemId = 1;
      const itemFixture = (new ItemBuilder())
        .withId(itemId)
        .withName('magic wand')
        .build();
      const zombieId = 10;
      const zombieFixture = (new ZombieBuilder())
        .withId(zombieId)
        .withName('zombie')
        .withItems([itemFixture])
        .build();

      itemsServiceStub.findOne.resolves(itemFixture);

      // Act
      await expect(zombieService.addItemToZombie(zombieFixture, itemId)).to.eventually.be.rejectedWith(
        HttpError,
        'Item is already assigned'
      );

      // Assert
      expect(itemsServiceStub.findOne).to.have.been.calledOnceWith(itemId);
      expect(zombieRepositoryStub.save).to.not.have.been.called;
    });
  });

  describe('removeItemFromZombie', () => {
    it('should remove item from zombie', async () => {
      // Arrange
      const itemId = 1;
      const itemFixture = (new ItemBuilder())
        .withId(itemId)
        .withName('magic wand')
        .build();
      const zombieId = 10;
      const zombieFixture = (new ZombieBuilder())
        .withId(zombieId)
        .withName('zombie')
        .withItems([itemFixture])
        .build();
      const zombieFixture2 = (new ZombieBuilder())
        .withId(zombieId)
        .withName('zombie')
        .withItems([])
        .build();

      zombieRepositoryStub.save.resolves(zombieFixture2);

      // Act
      const result = await expect(zombieService.removeItemFromZombie(zombieFixture, itemId)).to.eventually.be.fulfilled;

      // Assert
      expect(zombieRepositoryStub.save).to.have.been.calledOnceWith(zombieFixture);
      expect(result.length).to.eq(0);
    });
  });

  describe('getTotalItemsPriceForZombie', () => {
    it('should get total items price for zombie', async () => {
      // Arrange
      const itemFixture = (new ItemBuilder())
        .withId(1)
        .withName('sprint boots')
        .withPrice(200)
        .build();
      const itemFixture2 = (new ItemBuilder())
        .withId(2)
        .withName('dragon wand')
        .withPrice(100)
        .build();
      const zombieFixture = (new ZombieBuilder())
        .withId(5)
        .withName('zombie')
        .withItems([
          itemFixture,
          itemFixture2
        ])
        .build();
      const totalPricesResult = [{
        code: ExchangeRateCode.USD,
        total: 123
      }];

      exchangeRateServiceStub.getTotalPriceAllCurrencies.resolves(totalPricesResult);

      // Act
      const result = await expect(zombieService.getTotalItemsPriceForZombie(zombieFixture)).to.eventually.be.fulfilled;

      // Assert
      expect(exchangeRateServiceStub.getTotalPriceAllCurrencies).calledOnceWith(itemFixture.price + itemFixture2.price);
      expect(result).to.be.eql(totalPricesResult);
    });
  });
});
