import {MigrationInterface, QueryRunner, Table} from 'typeorm';
import {TABLE_NAME as ZOMBIES_TABLE_NAME} from "../zombie/zombie.model";

export class Zombie1613475632269 implements MigrationInterface {

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
        length: '100',
        name: 'name',
        type: 'varchar',
      }, {
        default: 'CURRENT_TIMESTAMP',
        name: 'created',
        type: 'timestamp'
      }, {
        default: 'CURRENT_TIMESTAMP',
        name: 'updated',
        type: 'timestamp'
      }],
      name: ZOMBIES_TABLE_NAME,
      uniques: [{
        columnNames: ['name'],
        name: 'zombie_name_unique'
      }]
    }), true, true, true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(ZOMBIES_TABLE_NAME, true);
  }
}
