import { Type, type Static, FormatRegistry } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { isURL } from "validator";

FormatRegistry.Set("url", isURL);

const ConfigSchema = Type.Object({
  ws: Type.Readonly(Type.Object({ url: Type.Readonly(Type.String()) })),
  http: Type.Readonly(
    Type.Object({
      port: Type.Readonly(Type.Number()),
      hostname: Type.Readonly(Type.String()),
    }),
  ),
  mongodb: Type.Readonly(Type.Object({ url: Type.Readonly(Type.String()) })),
  logger: Type.Readonly(Type.Object({ level: Type.Readonly(Type.String()) })),
  syncMS: Type.Readonly(Type.Number()),
});

type Config = Static<typeof ConfigSchema>;

export class ConfigService {
  constructor(private readonly config: Config) {}

  static init() {
    const rawConfig = {
      ws: { url: process.env.WA_WS_URL },
      http: { port: process.env.WA_HTTP_PORT, hostname: process.env.WA_HTTP_HOSTNAME },
      mongodb: { url: process.env.WA_MONGODB_URL },
      logger: { level: process.env.WA_LOGGER_LEVEL },
      syncMS: process.env.WA_SYNC_MS || 60 * 1000,
    };
    const config: Config = Value.Convert(ConfigSchema, rawConfig) as Config;

    const isValid = Value.Check(ConfigSchema, config);
    if (!isValid) {
      throw new TypeError("config must be a valid ConfigSchema");
    }

    return new ConfigService(config);
  }

  get ws() {
    return this.config.ws;
  }

  get http() {
    return this.config.http;
  }

  get mongodb() {
    return this.config.mongodb;
  }

  get logger() {
    return this.config.logger;
  }

  get syncMS() {
    return this.config.syncMS;
  }
}
