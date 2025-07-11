import WebSocket from "ws";
import { WeatherCreateService } from "./services/weather-create.service";

export class WeatherWsController {
  constructor(protected readonly weatherCreateService: WeatherCreateService) {}

  static async init() {
    const weatherCreateService = await WeatherCreateService.init();

    return new this(weatherCreateService);
  }

  async create(_ws: WebSocket.WebSocket, data: WebSocket.Data) {
    const input = JSON.parse((data as Buffer).toString()) as unknown;
    await this.weatherCreateService.execute(input);
  }
}
