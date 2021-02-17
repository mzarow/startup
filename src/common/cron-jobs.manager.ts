import {Container} from "typedi";
import {ItemsProcessor, ItemsProcessorImpl} from "../items/items.processor";
import {CronJob} from 'cron';
import {ExchangeRatesProcessor, ExchangeRatesProcessorImpl} from "../exchange-rates/exchange-rates.processor";

interface CronJobDefinition {
  handler: () => void;
  schedule: string;
  timeZone: string;
}

export const CRON_JOBS: CronJobDefinition[] = [
  {
    handler: async () => {
      const itemsProcessor: ItemsProcessor = Container.get(ItemsProcessorImpl);
      await itemsProcessor.processItemsFromExchange(true);
    },
    schedule: '1 0 * * *', // minute after 00:00
    timeZone: 'UTC'
  },
  {
    handler: async () => {
      const exchangeRatesProcessor: ExchangeRatesProcessor = Container.get(ExchangeRatesProcessorImpl);
      await exchangeRatesProcessor.processExchangeRates(true);
    },
    schedule: '1 0 * * *', // minute after 00:00
    timeZone: 'Europe/Warsaw'
  },
];

export class CronJobsManager {

  public registerJobs(): void {
    CRON_JOBS.forEach((jobDefinition: CronJobDefinition) => {
      const job = new CronJob(
        jobDefinition.schedule,
        jobDefinition.handler,
        null,
        true,
        jobDefinition.timeZone);
      job.start();
    });
  }
}

export const cronJobsManager = new CronJobsManager();
