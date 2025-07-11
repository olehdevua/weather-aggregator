import { Static, Type } from "@sinclair/typebox";

export const WeatherDataSchema = Type.Object({
  city: Type.String(),
  timestamp: Type.String(),
  temperature: Type.Number(),
  windspeed: Type.Number(),
  winddirection: Type.Number(),
});
export type WeatherDataDto = Static<typeof WeatherDataSchema>;

export const SearchWeatherSchema = Type.Object({
  city: Type.String(),
  startDate: Type.Date(),
  endDate: Type.Optional(Type.Date()),
});
export type SearchWeatherDto = Static<typeof SearchWeatherSchema>;
