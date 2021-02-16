import {Container} from "typedi";
import {ZombieItemsProcessorImpl} from "../zombie-items/zombie-items.processor";
import {CronJob} from 'cron';

interface CronJobDefinition {
  handler: () => void;
  schedule: string;
}

export const CRON_JOBS: CronJobDefinition[] = [
  {
    handler: async () => {
      const zombieItemsProcessor = Container.get(ZombieItemsProcessorImpl);
      await zombieItemsProcessor.processItemsFromExchange();
    },
    schedule: '1 0 * * *' // minute after 00:00
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
        'UTC');
      job.start();
    });
  }
}

export const cronJobsManager = new CronJobsManager();
