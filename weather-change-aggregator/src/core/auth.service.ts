import pino from "pino";
import { LoggerService } from "./logger.service";

export class AuthService {
  static init() {
    const { logger } = LoggerService.init();

    return new this(logger);
  }

  constructor(protected readonly logger: pino.Logger) {}

  // eslint-disable-next-line
  async authenticate(token?: string) {
    this.logger.info({ token }, "Token is valid");
    // or throw an AuthenticationError
  }

  // eslint-disable-next-line
  async authorize(token?: string) {
    this.logger.info({ token }, "User is authorized");
    // or throw an AuthorizationError
  }
}
