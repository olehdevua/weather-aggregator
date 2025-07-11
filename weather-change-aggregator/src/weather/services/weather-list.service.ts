import pino from "pino";
import { WeatherDataRepo } from "../repos/weather-data.repo";
import { validate } from "../../lib/typebox-schema";
import { SearchWeatherSchema } from "../weather.dto";
import { LoggerService } from "../../core/logger.service";

export class WeatherListService {
  constructor(
    private readonly logger: pino.Logger,
    private readonly weatherSnapshotRepo: WeatherDataRepo,
  ) {}

  static async init() {
    const weatherSnapshotRepo = await WeatherDataRepo.init();
    const { logger } = LoggerService.init();
    return new this(logger, weatherSnapshotRepo);
  }

  async execute(input: unknown) {
    this.logger.info(input, "[WeatherListService] input");

    const search = validate(SearchWeatherSchema, input);
    this.logger.info(search, "[WeatherListService] valid input");

    const result = await this.weatherSnapshotRepo.findMany(search);

    console.error(result);

    this.logger.debug(result, "[WeatherListService] result");
    this.logger.info(result, "[WeatherListService] done successfully");

    return result;
  }
}
