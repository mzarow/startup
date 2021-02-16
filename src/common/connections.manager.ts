import {Connection, createConnection} from 'typeorm';
import * as config from 'nconf';

export class ConnectionsManager {
  public connection: Connection;

  public async create(): Promise<void> {
    this.connection = await createConnection(
      {
        ...config.get('mysql'),
        entities: [`${__dirname}/../**/*.model.{js,ts}`],
      }
    );
  }

  public async close(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
    }
  }
}

export const manager = new ConnectionsManager();
