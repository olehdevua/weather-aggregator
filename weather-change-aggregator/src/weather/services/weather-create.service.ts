import pino from "pino";
import { WeatherDataSchema } from "../weather.dto";
import { WeatherDataRepo } from "../repos/weather-data.repo";
import { validate } from "../../lib/typebox-schema";
import { LoggerService } from "../../core/logger.service";

export class WeatherCreateService {
  constructor(
    private readonly logger: pino.Logger,
    private readonly weatherSnapshotRepo: WeatherDataRepo,
  ) {}

  static async init() {
    const weatherSnapshotRepo = await WeatherDataRepo.init();
    const { logger } = LoggerService.init();
    return new this(logger, weatherSnapshotRepo);
  }

  async execute(data: unknown): Promise<void> {
    const weatherData = validate(WeatherDataSchema, data);
    this.logger.debug(weatherData, "[WeatherCreateService] data is valid");

    await this.weatherSnapshotRepo.createWeatherSnapshot(weatherData);

    this.logger.debug("[WeatherCreateService] done successfully");
  }
}
