import pino from "pino";
import WebSocket from "ws";
import { ConfigService } from "../core/config.service";
import { LoggerService } from "../core/logger.service";

export class WsServer {
  private ws!: WebSocket.WebSocket;

  static init() {
    const config = ConfigService.init();
    const { logger } = LoggerService.init();
    return new this(config, logger);
  }

  constructor(
    private readonly config: ConfigService,
    private readonly logger: pino.Logger,
  ) {}

  run(handler: (ws: WebSocket.WebSocket) => void) {
    this.ws = new WebSocket(this.config.ws.url);

    this.ws.on("open", () => {
      this.logger.info("[WsServer] Connected to weather stream simulator");
    });
    this.ws.on("error", (error) => {
      this.logger.error(error);
    });

    handler(this.ws);

    this.ws.on("close", () => {
      this.logger.info("[WsServer] Disconnected from weather stream simulator");
    });

    return new Promise((resolve, reject) => {
      this.ws.once("error", reject);
      this.ws.once("open", () => {
        this.ws.removeListener("error", reject);
        resolve(this.ws);
      });
    });
  }
}
