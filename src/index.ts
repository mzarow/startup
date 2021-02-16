import { App } from './app';

const app = new App();

(async () => {
  await app.start();

  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
})();

async function stop() {
  await app.stop();
  process.exit(0);
}
