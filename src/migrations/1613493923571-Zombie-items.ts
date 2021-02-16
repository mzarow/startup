import {MigrationInterface, QueryRunner, Table} from "typeorm";
import {TABLE_NAME} from "../zombie-items/zombie-item.model";

export class ZombieItems1613493923571 implements MigrationInterface {

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
        name: 'name',
        type: 'varchar',
      }, {
        isNullable: false,
        name: 'price',
        type: 'integer',
      }, {
        default: 'CURRENT_TIMESTAMP',
        name: 'created',
        type: 'timestamp'
      }, {
        default: 'CURRENT_TIMESTAMP',
        name: 'updated',
        type: 'timestamp'
      }],
      name: TABLE_NAME,
      uniques: [{
        columnNames: ['name'],
        name: 'zombie_item_name_unique'
      }]
    }), true, true, true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(TABLE_NAME, true);
  }
}
