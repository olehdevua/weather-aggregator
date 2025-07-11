import { ObjectId } from "mongodb";

export class WeatherModel {
  public _id!: ObjectId;
  public city!: string;
  public minTemperature?: number;
  public maxTemperature?: number;
  public openTemperature?: number;
  public closeTemperature?: number;
  public createdAt!: Date;

  static initDefault(city: string) {
    const model = new this();

    model._id = new ObjectId();
    model.city = city;
    model.createdAt = new Date();

    return model;
  }

  public updateTemperature(temperature: number) {
    if (!this.minTemperature || temperature < this.minTemperature) {
      this.minTemperature = temperature;
    }
    if (!this.maxTemperature || temperature > this.maxTemperature) {
      this.maxTemperature = temperature;
    }
    if (!this.openTemperature) {
      this.openTemperature = temperature;
    }
    this.closeTemperature = temperature;
  }
}
