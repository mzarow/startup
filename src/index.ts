import { App } from './app';

const app = new App();

(async () => {
  await app.start();

  process.on('SIGINT', () => stop());
  process.on('SIGTERM', () => stop());
  process.on('unhandledRejection', (error: any) => {
    throw error;
  });
  process.on('uncaughtException', (error: any) => {
    console.error(error);
    stop(1);
  });
})();

async function stop(exitCode: number = 0): Promise<void> {
  await app.stop();
  process.exit(exitCode);
}
