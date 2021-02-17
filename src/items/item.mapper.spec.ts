import {expect} from 'chai';
import {ItemMapper, ItemMapperImpl} from "./item.mapper";
import {ItemBuilder} from "../../test/utils/builders/item.builder";
import {ItemDto} from "./item.dto";
import {Item} from "./item.model";

describe('Item Mapper', () => {
  let itemMapper: ItemMapper;

  beforeEach(() => {
    itemMapper = new ItemMapperImpl();
  });

  describe('fromDtoToDomain', () => {
    it('should map dto to domain', () => {
      // Arrange
      const itemDto: ItemDto = {
        id: 10,
        name: 'golden legs',
        price: 1000
      };

      // Act
      const result = itemMapper.fromDtoToDomain(itemDto);

      // Assert
      expect(result).to.be.instanceOf(Item);
      expect(result.id).to.eq(itemDto.id);
      expect(result.name).to.eq(itemDto.name);
      expect(result.price).to.eq(itemDto.price);
    });
  });

  describe('fromDomainToDto', () => {
    it('should map domain to dto', () => {
      // Arrange
      const item = (new ItemBuilder())
        .withId(10)
        .withName('item')
        .withPrice(125)
        .build();

      // Act
      const result = itemMapper.fromDomainToDto(item);

      // Assert
      expect(result).to.be.instanceOf(ItemDto);
      expect(result.name).to.eq(item.name);
      expect(result.price).to.eq(item.price);
    });
  });
});
