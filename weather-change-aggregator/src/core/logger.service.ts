import pino from "pino";
import { ConfigService } from "./config.service";

let logger!: pino.Logger;

export class LoggerService {
  static init() {
    if (!logger) {
      const config = ConfigService.init();
      logger = pino({ level: config.logger.level });
    }

    return new this(logger);
  }

  constructor(public readonly logger: pino.Logger) {}
}
