import { ObjectId } from "mongodb";

export const mockDate = new Date("2025-07-10T13:45:00.000Z");

const cities = ["Berlin", "NewYork", "Tokyo", "SaoPaulo", "CapeTown"];
const timestamps = [
  "2025-07-10T10:45",
  "2025-07-10T11:45",
  "2025-07-10T12:45",
  "2025-07-10T13:45",
];

const temperatures = [
  30.53, 1.564, 0.436, 17.66, 35.0, 9.577, 8.133, 0.421, 36.59, 24.42, 12.42, 26.28,
  7.949, 7.876, 32.26, 34.44, 17.27, 10.27, 35.45, 20.76, -3.3, -10.1,
];

export const weatherData: {
  city: string;
  timestamp: string;
  temperature: number;
  windspeed: number;
  winddirection: number;
}[] = [];

let tempCounter = 0;
for (const timestamp of timestamps) {
  for (const city of cities) {
    weatherData.push({
      city,
      timestamp,
      temperature: temperatures[tempCounter++] as number,
      windspeed: 10,
      winddirection: 100,
    });
  }
}

export const weatherEntities = [
  {
    _id: createObjectId("2025-07-10T07:45:00.000Z"),
    createdAt: new Date("2025-07-10T07:45:00.000Z"),
    city: "Berlin",
    minTemperature: 3,
    maxTemperature: 33,
    openTemperature: 7,
    closeTemperature: 23,
  },
  {
    _id: createObjectId("2025-07-10T07:45:01.000Z"),
    createdAt: new Date("2025-07-10T07:45:01.000Z"),
    city: "NewYork",
    minTemperature: 2,
    maxTemperature: 40,
    openTemperature: 20,
    closeTemperature: 23,
  },
  {
    _id: createObjectId("2025-07-10T08:25:00.000Z"),
    createdAt: new Date("2025-07-10T08:25:00.000Z"),
    city: "Berlin",
    minTemperature: 5,
    maxTemperature: 25,
    openTemperature: 13,
    closeTemperature: 23,
  },
  {
    _id: createObjectId("2025-07-10T08:25:01.000Z"),
    createdAt: new Date("2025-07-10T08:25:01.000Z"),
    city: "NewYork",
    minTemperature: -1,
    maxTemperature: 20,
    openTemperature: 13,
    closeTemperature: 19,
  },
  {
    _id: createObjectId("2025-07-10T08:45:00.000Z"),
    createdAt: new Date("2025-07-10T08:45:00.000Z"),
    city: "Berlin",
    minTemperature: 4,
    maxTemperature: 24,
    openTemperature: 20,
    closeTemperature: 10,
  },
  {
    _id: createObjectId("2025-07-10T08:45:01.000Z"),
    createdAt: new Date("2025-07-10T08:45:01.000Z"),
    city: "NewYork",
    minTemperature: 20,
    maxTemperature: 33,
    openTemperature: 23,
    closeTemperature: 25,
  },
  // newer
  {
    _id: createObjectId("2025-07-10T13:40:00.000Z"),
    createdAt: new Date("2025-07-10T13:40:00.000Z"),
    city: "Berlin",
    minTemperature: 20,
    maxTemperature: 33,
    openTemperature: 23,
    closeTemperature: 25,
  },
  {
    _id: createObjectId("2025-07-10T13:40:01.000Z"),
    createdAt: new Date("2025-07-10T13:40:01.000Z"),
    city: "NewYork",
    minTemperature: -3,
    maxTemperature: 13,
    openTemperature: 0,
    closeTemperature: 10,
  },
  {
    _id: createObjectId("2025-07-10T13:43:00.000Z"),
    createdAt: new Date("2025-07-10T13:43:00.000Z"),
    city: "Berlin",
    minTemperature: 14,
    maxTemperature: 44,
    openTemperature: 15,
    closeTemperature: 31,
  },
  {
    _id: createObjectId("2025-07-10T13:43:01.000Z"),
    createdAt: new Date("2025-07-10T13:43:01.000Z"),
    city: "NewYork",
    minTemperature: 24,
    maxTemperature: 41,
    openTemperature: 25,
    closeTemperature: 38,
  },
];

function createObjectId(timeString: string): ObjectId {
  return ObjectId.createFromTime(
    Math.floor(new Date(new Date(timeString)).valueOf() / 1000),
  );
}
