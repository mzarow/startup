import {BaseEntity} from "../common/base-entity";
import {Column, Entity} from "typeorm";
import {ExchangeRateCode} from "./exchange-rate-code.enum";

export const TABLE_NAME = 'exchange_rate';

@Entity(TABLE_NAME)
export class ExchangeRate extends BaseEntity {
  @Column()
  public code: ExchangeRateCode;

  @Column()
  public bid: string;

  @Column()
  public ask: string;
}
