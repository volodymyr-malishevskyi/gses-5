export type Weather = {
  city: string;
  temperature: {
    c: number;
    f: number;
  };
  humidity: number;
  shortDescription: string;
};

export interface IWeatherApiService {
  getWeatherByCity(city: string): Promise<Weather>;
}
