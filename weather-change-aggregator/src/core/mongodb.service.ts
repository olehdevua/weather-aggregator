import { Db, MongoClient, MongoClientOptions } from "mongodb";
import { LoggerService } from "./logger.service";

let mongodbClient: MongodbClient;

export class MongodbClient {
  protected constructor(
    public readonly client: MongoClient,
    public readonly db: Db,
  ) {}

  static async init(url: string, opts?: MongoClientOptions): Promise<MongodbClient> {
    if (mongodbClient) {
      return mongodbClient;
    }
    const { logger } = LoggerService.init();
    const client = new MongoClient(url, opts);
    await client.connect();
    const db = client.db();

    logger.error({ dbName: db.databaseName }, "Mongodb client connected");
    mongodbClient = new MongodbClient(client, db);

    return mongodbClient;
  }
}
