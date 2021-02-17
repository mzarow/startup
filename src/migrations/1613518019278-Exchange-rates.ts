import {MigrationInterface, QueryRunner, Table} from "typeorm";
import {TABLE_NAME} from "../exchange-rates/exchange-rate.model";

export class ExchangeRates1613518019278 implements MigrationInterface {

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
        name: 'code',
        type: 'varchar',
      }, {
        isNullable: false,
        name: 'bid',
        type: 'varchar',
      }, {
        isNullable: false,
        name: 'ask',
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
      name: TABLE_NAME,
      uniques: [{
        columnNames: ['code'],
        name: 'code_unique'
      }]
    }), true, true, true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(TABLE_NAME, true);
  }
}
