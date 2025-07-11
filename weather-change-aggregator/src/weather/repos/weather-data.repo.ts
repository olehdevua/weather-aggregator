import pino from "pino";
import { ObjectId } from "mongodb";
import { MongodbClient } from "../../core/mongodb.service";
import { ConfigService } from "../../core/config.service";
import { SearchWeatherDto, WeatherDataDto } from "../weather.dto";
import { LoggerService } from "../../core/logger.service";
import { DateTime } from "luxon";
import { WeatherModel } from "../models/weather.model";

let models: Record<string, WeatherModel> = {};

export class WeatherDataRepo {
  protected collectionName: string = "weather";

  constructor(
    protected readonly logger: pino.Logger,
    protected readonly mongoClient: MongodbClient,
    protected readonly syncMs: number = 60 * 1000,
  ) {}

  static async init() {
    const config = ConfigService.init();
    const { logger } = LoggerService.init();
    const mongodbClient = await MongodbClient.init(config.mongodb.url);

    return new this(logger, mongodbClient, config.syncMS);
  }

  async findMany(params: SearchWeatherDto) {
    this.logger.info(params, "[WeatherSnapshotRepo] findMany");

    const startObjectId = ObjectId.createFromTime(
      Math.floor(new Date(params.startDate).valueOf() / 1000),
    );
    const endObjectId = ObjectId.createFromTime(
      Math.floor(new Date(params.endDate ?? new Date()).valueOf() / 1000),
    );

    const range = generateHourlyDateRangeNative(
      params.startDate,
      params.endDate ?? new Date(),
    );

    return await this.mongoClient.db
      .collection(this.collectionName)
      .aggregate([
        {
          $match: { _id: { $gte: startObjectId, $lte: endObjectId }, city: params.city },
        },
        { $sort: { _id: 1 } },
        {
          $bucket: {
            groupBy: "$createdAt",
            boundaries: range,
            output: {
              minTemperature: { $min: "$minTemperature" },
              maxTemperature: { $max: "$maxTemperature" },
              openTemperature: { $first: "$openTemperature" },
              closeTemperature: { $last: "$closeTemperature" },
            },
          },
        },
      ])
      .toArray();
  }

  async createWeatherSnapshot({ city, temperature }: WeatherDataDto) {
    const cityWeatherData = (models[city] =
      models[city] ?? WeatherModel.initDefault(city));

    cityWeatherData.updateTemperature(temperature);

    const timeToSync =
      new Date().valueOf() - cityWeatherData.createdAt.valueOf() > this.syncMs;

    if (timeToSync) {
      this.logger.info("[WeatherSnapshotRepo] sync data");

      const entities = Object.values(models);
      const result = await this.mongoClient.db
        .collection(this.collectionName)
        .insertMany(entities);

      if (!result.acknowledged) {
        this.logger.warn("[WeatherSnapshotRepo] failed to write");
        return;
      }

      if (result.insertedCount !== entities.length) {
        this.logger.warn("[WeatherSnapshotRepo] not all entities inserted");
      }

      models = {};
    }
  }
}

function generateHourlyDateRangeNative(startDate: Date, endDate: Date) {
  const dates = [];
  const oneHourInMs = 60 * 60 * 1000;

  if (startDate.getTime() > endDate.getTime()) {
    return [];
  }

  for (
    let currentTimeMs = DateTime.fromJSDate(startDate).startOf("hour").valueOf();
    currentTimeMs <= DateTime.fromJSDate(endDate).plus({ hour: 1 }).valueOf();
    currentTimeMs += oneHourInMs
  ) {
    const currentDateTime = new Date(currentTimeMs);
    dates.push(currentDateTime);
  }

  return dates;
}
