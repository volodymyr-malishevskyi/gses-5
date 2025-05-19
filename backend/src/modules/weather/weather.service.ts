import { WeatherApiService } from '@/common/services/weather-api/weather-api';
import { Weather } from './types/weather';

export interface WeatherServiceConfig {
  apiKey: string;
}

export class WeatherService {
  constructor(private weatherApiService: WeatherApiService) {}

  async getWeatherByCity(city: string): Promise<Weather> {
    const { current } = await this.weatherApiService.getWeatherByCity(city);

    const description = `Weather in ${city}: ${current.temp_c}°C, ${current.humidity}%, ${current.condition.text}`;

    return {
      temperature: current.temp_c,
      humidity: current.humidity,
      description,
    };
  }
}
