import {expect} from 'chai';
import {ZombieMapper, ZombieMapperImpl} from "./zombie.mapper";
import {ZombieBuilder} from "../../test/utils/builders/zombie.builder";
import {ZombieDto} from "./zombie.dto";
import {Zombie} from "./zombie.model";

describe('Zombie Mapper', () => {
  let zombieMapper: ZombieMapper;

  beforeEach(() => {
    zombieMapper = new ZombieMapperImpl();
  });

  describe('fromDomainToDto', () => {
    it('should map domain to dto', () => {
      // Arrange
      const zombie = (new ZombieBuilder())
        .withId(10)
        .withName('my-zombie')
        .build();

      // Act
      const result = zombieMapper.fromDomainToDto(zombie);

      // Assert
      expect(result).to.be.instanceOf(ZombieDto);
      expect(result.name).to.eq(zombie.name);
      expect(result.created).to.eq(zombie.created);
    });
  });

  describe('fromDtoToDomain', () => {
    it('should map dto to domain', () => {
      // Arrange
      const zombieDto: ZombieDto = {
        name: 'my-zombie'
      };

      // Act
      const result = zombieMapper.fromDtoToDomain(zombieDto);

      // Assert
      expect(result).to.be.instanceOf(Zombie);
      expect(result.name).to.eq(zombieDto.name);
    });
  });
});
