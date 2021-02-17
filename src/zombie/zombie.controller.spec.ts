import {expect, use} from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import {SinonSandbox, SinonStubbedInstance} from 'sinon';
import {ZombieController} from "./zombie.controller";
import {ZombieService, ZombieServiceImpl} from "./zombie.service";
import {ZombieMapper, ZombieMapperImpl} from "./zombie.mapper";
import {ItemMapper, ItemMapperImpl} from "../items/item.mapper";
import {Zombie} from "./zombie.model";
import {ZombieBuilder} from "../../test/utils/builders/zombie.builder";
import {ZombieDto} from "./zombie.dto";
import {NotFoundError} from "routing-controllers";
import {ItemBuilder} from "../../test/utils/builders/item.builder";
import {TotalPriceResult} from "../exchange-rates/exchange-rate.service";
import {ExchangeRateCode} from "../exchange-rates/exchange-rate-code.enum";

use(sinonChai);
use(chaiAsPromised);

describe('Zombie Controller', () => {
  let sandbox: SinonSandbox;
  let zombieServiceStub: SinonStubbedInstance<ZombieService>;
  let zombieMapperStub: SinonStubbedInstance<ZombieMapper>;
  let itemMapperStub: SinonStubbedInstance<ItemMapper>;
  let zombieController: ZombieController;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    zombieServiceStub = sandbox.createStubInstance(ZombieServiceImpl);
    zombieMapperStub = sandbox.createStubInstance(ZombieMapperImpl);
    itemMapperStub = sandbox.createStubInstance(ItemMapperImpl);
    zombieController = new ZombieController(
      zombieServiceStub,
      zombieMapperStub,
      itemMapperStub
    );
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getAll', () => {
    it('should return zombies list', async () => {
      // Arrange
      const zombieFixture = (new ZombieBuilder())
        .withId(10)
        .withName('my-zombie')
        .build();
      const zombieListFixture: Zombie[] = [zombieFixture];

      zombieServiceStub.listAll.resolves(zombieListFixture);
      zombieMapperStub.fromDomainToDto.returns({name: zombieFixture.name});

      // Act && Assert
      const result = await expect(zombieController.getAll()).to.eventually.be.fulfilled;

      expect(zombieServiceStub.listAll).to.have.been.calledOnce;
      expect(zombieMapperStub.fromDomainToDto).to.have.been.calledOnceWith(zombieFixture);
      expect(result.length).to.eq(zombieListFixture.length);
      expect(result[0].name).to.eq(zombieFixture.name);
    });
  });

  describe('getOne', () => {
    it('should return one zombie', async () => {
      // Arrange
      const zombieId = 2;
      const zombieFixture = (new ZombieBuilder())
        .withId(zombieId)
        .withName('my-zombie')
        .build();

      zombieServiceStub.findOne.resolves(zombieFixture);
      zombieMapperStub.fromDomainToDto.returns({name: zombieFixture.name});

      // Act && Assert
      const result = await expect(zombieController.getOne(zombieId)).to.eventually.be.fulfilled;

      expect(zombieServiceStub.findOne).to.have.been.calledOnceWith(zombieId);
      expect(zombieMapperStub.fromDomainToDto).to.have.been.calledOnceWith(zombieFixture);
      expect(result.name).to.eq(zombieFixture.name);
    });

    it('should throw if zombie not found', async () => {
      // Arrange
      const zombieId = 3;

      zombieServiceStub.findOne.resolves(undefined);

      // Act && Assert
      await expect(zombieController.getOne(zombieId)).to.eventually.be.rejectedWith(
        NotFoundError,
        'Zombie not found'
      );

      expect(zombieServiceStub.findOne).to.have.been.calledOnceWith(zombieId);
      expect(zombieMapperStub.fromDomainToDto).to.not.have.been.called;
    });
  });

  describe('create', () => {
    it('should create zombie', async () => {
      // Arrange
      const zombieDto: ZombieDto = {
        name: 'new-zombie'
      };
      const zombieFixture = (new ZombieBuilder())
        .withId(4)
        .withName(zombieDto.name)
        .build();

      zombieMapperStub.fromDtoToDomain.returns(zombieFixture);
      zombieServiceStub.create.resolves(zombieFixture);
      zombieMapperStub.fromDomainToDto.returns(zombieDto);

      // Act && Assert
      const result = await expect(zombieController.create(zombieDto)).to.eventually.be.fulfilled;

      expect(zombieMapperStub.fromDtoToDomain).to.have.been.calledOnceWith(zombieDto);
      expect(zombieServiceStub.create).to.have.been.calledOnceWith(zombieFixture);
      expect(zombieMapperStub.fromDomainToDto).to.have.been.calledOnceWith(zombieFixture);
      expect(result).to.be.eql(zombieDto);
    });
  });

  describe('update', () => {
    it('should update zombie', async () => {
      // Arrange
      const zombieId = 5;
      const zombieDto: ZombieDto = {
        name: 'updated-name'
      };
      const zombieFixture1 = (new ZombieBuilder())
        .withId(4)
        .withName('old-name')
        .build();
      const zombieFixture2 = {
        ...zombieFixture1,
        name: zombieDto.name
      };

      zombieMapperStub.fromDtoToDomain.returns(zombieFixture1);
      zombieServiceStub.update.resolves(zombieFixture2);
      zombieMapperStub.fromDomainToDto.returns(zombieDto);

      // Act && Assert
      const result = await expect(zombieController.update(zombieId, zombieDto)).to.eventually.be.fulfilled;

      expect(zombieMapperStub.fromDtoToDomain).to.have.been.calledOnceWith(zombieDto);
      expect(zombieServiceStub.update).to.have.been.calledOnceWith(zombieId, zombieFixture1);
      expect(zombieMapperStub.fromDomainToDto).to.have.been.calledOnceWith(zombieFixture2);
      expect(result).to.be.eql(zombieDto);
    });
  });

  describe('delete', () => {
    it('should delete zombie', async () => {
      // Arrange
      const zombieId = 5;

      // Act && Assert
      const result = await expect(zombieController.delete(zombieId)).to.eventually.be.fulfilled;

      expect(zombieServiceStub.delete).to.have.been.calledOnceWith(zombieId);
      expect(result).to.be.null;
    });
  });

  describe('getItems', () => {
    it('should list zombie items', async () => {
      // Arrange
      const itemFixture = (new ItemBuilder())
        .withName('glacier sword')
        .withPrice(100)
        .build();
      const zombieId = 5;
      const zombieFixture = (new ZombieBuilder())
        .withId(zombieId)
        .withName('my-zombie')
        .withItems([itemFixture])
        .build();
      const itemDto = {
        id: itemFixture.id,
        name: itemFixture.name,
        price: itemFixture.price
      };

      zombieServiceStub.findOne.resolves(zombieFixture);
      itemMapperStub.fromDomainToDto.returns(itemDto);

      // Act && Assert
      const result = await expect(zombieController.getItems(zombieId)).to.eventually.be.fulfilled;

      expect(zombieServiceStub.findOne).to.have.been.calledOnceWith(zombieId, true);
      expect(result.length).to.eq(zombieFixture.items.length);
      expect(result[0]).to.be.eql(itemDto);
    });

    it('should throw if zombie not found', async () => {
      // Arrange
      const zombieId = 5;

      zombieServiceStub.findOne.resolves(undefined);

      // Act && Assert
      await expect(zombieController.getItems(zombieId)).to.eventually.be.rejectedWith(
        NotFoundError,
        'Zombie not found'
      );

      expect(zombieServiceStub.findOne).to.have.been.calledOnceWith(zombieId, true);
      expect(itemMapperStub.fromDomainToDto).to.not.have.been.called;
    });
  });

  describe('removeItem', () => {
    it('should remove item from zombie', async () => {
      // Arrange
      const zombieId = 5;
      const itemId = 10;
      const itemFixture = (new ItemBuilder())
        .withId(itemId)
        .withName('glacier sword')
        .withPrice(100)
        .build();
      const itemDto = {
        id: itemFixture.id,
        name: itemFixture.name,
        price: itemFixture.price
      };
      const leftItems = [itemFixture];
      const zombieFixture = (new ZombieBuilder())
        .withId(zombieId)
        .withName('my-zombie')
        .withItems(leftItems)
        .build();


      zombieServiceStub.findOne.resolves(zombieFixture);
      zombieServiceStub.removeItemFromZombie.resolves(leftItems);
      itemMapperStub.fromDomainToDto.returns(itemDto);

      // Act && Assert
      const result = await expect(zombieController.removeItem(zombieId, itemId)).to.eventually.be.fulfilled;

      expect(zombieServiceStub.removeItemFromZombie).to.have.been.calledOnceWith(zombieFixture, itemId);
      expect(itemMapperStub.fromDomainToDto).to.have.been.calledOnceWith(itemFixture);
      expect(result.length).to.eq(leftItems.length);
      expect(result[0]).to.be.eql(itemDto);
    });

    it('should throw if zombie not found', async () => {
      // Arrange
      const zombieId = 5;
      const itemId = 10;

      zombieServiceStub.findOne.resolves(undefined);

      // Act && Assert
      await expect(zombieController.removeItem(zombieId, itemId)).to.eventually.be.rejectedWith(
        NotFoundError,
        'Zombie not found'
      );

      expect(zombieServiceStub.findOne).to.have.been.calledOnceWith(zombieId, true);
      expect(itemMapperStub.fromDomainToDto).to.not.have.been.called;
    });
  });

  describe('getItemsTotalValue', () => {
    it('should get total items value for zombie', async () => {
      // Arrange
      const zombieId = 5;
      const zombieFixture = (new ZombieBuilder())
        .withId(zombieId)
        .withName('my-zombie')
        .build();
      const totalPriceResults: TotalPriceResult[] = [{
        code: ExchangeRateCode.USD,
        total: 1000
      }];

      zombieServiceStub.findOne.resolves(zombieFixture);
      zombieServiceStub.getTotalItemsPriceForZombie.resolves(totalPriceResults);

      // Act && Assert
      const result = await expect(zombieController.getItemsTotalValue(zombieId)).to.eventually.be.fulfilled;

      expect(zombieServiceStub.getTotalItemsPriceForZombie).to.have.been.calledOnceWith(zombieFixture);
      expect(result).to.be.eql(totalPriceResults);
    });
  });
});
