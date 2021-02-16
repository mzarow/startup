import {Container} from "typedi";
import {ExternalItemsProcessor, ExternalItemsProcessorImpl} from "../items/external-items.processor";
import {CronJob} from 'cron';

interface CronJobDefinition {
  handler: () => void;
  schedule: string;
  timeZone: string;
}

export const CRON_JOBS: CronJobDefinition[] = [
  {
    handler: async () => {
      const externalItemsProcessor: ExternalItemsProcessor = Container.get(ExternalItemsProcessorImpl);
      await externalItemsProcessor.processItemsFromExchange();
    },
    schedule: '1 0 * * *', // minute after 00:00
    timeZone: 'UTC'
  }
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
