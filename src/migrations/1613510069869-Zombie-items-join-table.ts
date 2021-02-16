import {MigrationInterface, QueryRunner, Table} from "typeorm";
import {TABLE_NAME as ZOMBIE_TABLE_NAME} from "../zombie/zombie.model";
import {TABLE_NAME as ITEM_TABLE_NAME} from "../items/item.model";

export class ZombieItemsJoinTable1613510069869 implements MigrationInterface {
  private readonly tableName = 'zombies_items_items';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      columns: [{
        isGenerated: true,
        isPrimary: true,
        generationStrategy: 'increment',
        name: 'id',
        type: 'integer'
      }, {
        isNullable: false,
        name: 'zombiesId',
        type: 'integer',
      }, {
        isNullable: false,
        name: 'itemsId',
        type: 'integer',
      }],
      foreignKeys: [{
        columnNames: ['zombieId'],
        name: 'fk_zombie_items',
        onDelete: 'CASCADE',
        referencedColumnNames: ['id'],
        referencedTableName: ZOMBIE_TABLE_NAME
      }, {
        columnNames: ['itemId'],
        name: 'fk_items_zombie',
        onDelete: 'CASCADE',
        referencedColumnNames: ['id'],
        referencedTableName: ITEM_TABLE_NAME
      }],
      name: this.tableName,
      uniques: [{
        columnNames: ['zombieId', 'itemId'],
        name: 'zombieId_itemId_unique'
      }]
    }), true, true, true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName, true);
  }
}
