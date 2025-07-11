import pino from "pino";
import cors from "cors";
import http from "http";
import pinoExpress from "pino-http";
import express, { Express, Request, Response } from "express";
import { ConfigService } from "../core/config.service";
import { LoggerService } from "../core/logger.service";

export class HttpServer {
  public app!: Express;
  private server!: http.Server;

  static init() {
    const config = ConfigService.init();
    const { logger } = LoggerService.init();
    return new this(config, logger);
  }

  constructor(
    private readonly config: ConfigService,
    private readonly logger: pino.Logger,
  ) {}

  async run(handler: (app: Express) => void) {
    this.app = express();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.app.use(cors());

    this.app.use(express.json());
    this.app.use(pinoExpress(this.logger));

    handler(this.app);

    const { port, hostname } = this.config.http;
    this.server = await new Promise((resolve, reject) => {
      const server = this.app.listen(port, hostname, (error) => {
        if (error) {
          reject(error);
        }
        this.logger.info({ hostname, port }, "[HttpServer] listening");
        resolve(server);
      });
    });
  }

  async close(): Promise<void> {
    await new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(undefined);
      });
    });
  }
}
