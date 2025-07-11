process.env.WA_WS_URL = "ws://localhost:8080";
process.env.WA_HTTP_PORT = "3033";
process.env.WA_HTTP_HOSTNAME = "localhost";
process.env.WA_MONGODB_URL = "mongodb://localhost:27017/test-weather";
process.env.WA_LOGGER_LEVEL = "info";
process.env.WA_SYNC_MS = "1000";

import request from "supertest";
import MockDate from "mockdate";
import { runExpress } from "../index";
import { mockDate, weatherData, weatherEntities } from "./weather-data.mock";
import { HttpServer } from "../servers/http.server";
import { MongodbClient } from "../core/mongodb.service";

let server: HttpServer;
let mongodb: MongodbClient;

describe("Weather API E2E Tests", () => {
  beforeAll(async () => {
    server = await runExpress();
    mongodb = await MongodbClient.init(process.env.WA_MONGODB_URL as string);
  });

  afterAll(async () => {
    if (server) {
      await server.close();
    }
    if (mongodb) {
      await mongodb.client.close();
    }
  });

  beforeEach(async () => {
    await mongodb.db.collection("weather").deleteMany({});
    MockDate.set(mockDate);
  });
  afterEach(() => {
    MockDate.reset();
  });

  it("should return weather models for NewYork based on sent data before that", async () => {
    for (const data of weatherData) {
      await request(server.app).post("/weather").send(data);
    }
    // Sync Data in 1500ms
    MockDate.set(new Date(mockDate.valueOf() + 1500));
    await request(server.app)
      .post("/weather")
      .send(weatherData[weatherData.length - 1]);

    const response = await request(server.app).get(
      "/weather?city=NewYork&startDate=2025-07-10T10%3A00%3A00.000Z",
    );

    expect(response.status).toBe(200);

    const body = response.body as { content: any[] };

    expect(body.content).toBeInstanceOf(Array);
    expect(body.content.length).toBe(1);

    expect(body.content[0]).toMatchObject({
      closeTemperature: 17.27,
      maxTemperature: 26.28,
      minTemperature: 1.564,
      openTemperature: 1.564,
    });
  });

  it("should take max and min based on all entities in a bucket", async () => {
    await mongodb.db.collection("weather").insertMany(weatherEntities);

    const response = await request(server.app).get(
      "/weather?city=NewYork&startDate=2025-07-10T05%3A00%3A00.000Z",
    );

    expect(response.status).toBe(200);

    const body = response.body as { content: any[] };

    expect(body.content).toBeInstanceOf(Array);
    expect(body.content.length).toBe(3);

    expect(body.content[0]).toMatchObject({
      _id: "2025-07-10T07:00:00.000Z",
      closeTemperature: 23,
      maxTemperature: 40,
      minTemperature: 2,
      openTemperature: 20,
    });
    expect(body.content[1]).toMatchObject({
      _id: "2025-07-10T08:00:00.000Z",
      minTemperature: -1,
      maxTemperature: 33,
      openTemperature: 13,
      closeTemperature: 25,
    });
    expect(body.content[2]).toMatchObject({
      _id: "2025-07-10T13:00:00.000Z",
      minTemperature: -3,
      maxTemperature: 41,
      openTemperature: 0,
      closeTemperature: 38,
    });
  });

  it("should filter by startDate/endDate precisely", async () => {
    await mongodb.db.collection("weather").insertMany(weatherEntities);

    const response = await request(server.app).get(
      "/weather?city=NewYork&startDate=2025-07-10T08%3A45%3A01.000Z&endDate=2025-07-10T08%3A45%3A01.000Z",
    );

    expect(response.status).toBe(200);

    const body = response.body as { content: any[] };

    expect(body.content).toBeInstanceOf(Array);
    expect(body.content.length).toBe(1);

    expect(body.content[0]).toMatchObject({
      _id: "2025-07-10T08:00:00.000Z",
      minTemperature: 20,
      maxTemperature: 33,
      openTemperature: 23,
      closeTemperature: 25,
    });
  });
});
