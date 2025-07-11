import { Request, Response } from "express";
import { WeatherListService } from "./services/weather-list.service";
import { WeatherCreateService } from "./services/weather-create.service";

export class WeatherHttpController {
  constructor(
    protected readonly weatherListService: WeatherListService,
    protected readonly weatherCreateService: WeatherCreateService,
  ) {}

  static async init() {
    const weatherListService = await WeatherListService.init();
    const weatherCreateService = await WeatherCreateService.init();

    return new this(weatherListService, weatherCreateService);
  }

  async list(req: Request, res: Response) {
    const content = await this.weatherListService.execute(req.query);

    res.status(200).json({ content });
  }

  async create(req: Request, res: Response) {
    await this.weatherCreateService.execute(req.body);

    res.status(202).json({ content: { ok: true } });
  }
}
