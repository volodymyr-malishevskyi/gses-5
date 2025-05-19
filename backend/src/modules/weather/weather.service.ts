import { IWeatherApiService } from '@/common/interfaces/weather-api-service';
import { WeatherResponse } from './types/weather';

export interface WeatherServiceConfig {
  apiKey: string;
}

export class WeatherService {
  constructor(private weatherApiService: IWeatherApiService) {}

  async getWeatherByCity(city: string): Promise<WeatherResponse> {
    const weather = await this.weatherApiService.getWeatherByCity(city);

    const description = `Weather in ${city}: ${weather.temperature.c}°C, ${weather.humidity}%, ${weather.shortDescription}`;

    return {
      temperature: weather.temperature.c,
      humidity: weather.humidity,
      description,
    };
  }
}
