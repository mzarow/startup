import 'reflect-metadata';
import { Application } from 'express';
import * as express from 'express';
import { Container } from 'typedi';
import { useContainer as routingUseContainer, useExpressServer } from 'routing-controllers';
import { useContainer as ormUseContainer } from 'typeorm';
import { Server } from 'http';
import * as config from 'nconf';
import { manager as dbConnectionsManager } from "./common/connections.manager";

export class App {
  private app: Application;
  private server: Server;

  public async start() {
    ormUseContainer(Container);
    routingUseContainer(Container);

    this.bootstrap();

    await dbConnectionsManager.create();

    this.app = useExpressServer(express(),  {
      routePrefix: '/api',
      controllers: [`${__dirname}/controllers/*.{js,ts}`],
      middlewares: [`${__dirname}/middlewares/*.{js,ts}`],
    });

    const port = +config.get('port');

    this.server = this.app.listen(port);

    console.log(`Server started listening on port ${port}`);
  }

  public async stop() {
    await dbConnectionsManager.close();
    await this.server.close();
  }

  private bootstrap(): void {
    const env = 'default';
    const file = `${process.cwd()}/config/${env}.json`;

    config.file(env, { file });
  }
}
