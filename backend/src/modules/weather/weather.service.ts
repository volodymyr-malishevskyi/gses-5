import { HttpClient } from '@/common/http-client';
import { CityNotFoundError, WeatherApiError } from './errors/weather-service';
import { Weather } from './types/weather';
import { ErrorCode, ErrorResponse, WeatherResponse } from './types/weather-api';

export interface WeatherServiceConfig {
  apiKey: string;
}

export class WeatherService {
  constructor(
    private httpClient: HttpClient,
    private config: WeatherServiceConfig,
  ) {}

  async getWeatherByCity(city: string): Promise<Weather> {
    const { apiKey } = this.config;

    const response = await this.httpClient.get<WeatherResponse | ErrorResponse>(
      `https://api.weatherapi.com/v1/current.json`,
      {
        queryParams: {
          key: apiKey,
          q: city,
        },
        headers: {
          Accept: 'application/json',
        },
      },
    );

    if (response.status !== 200) {
      const responseContentType = response.headers.get('Content-Type');

      // In some cases, like like empty api key, the API returns response in HTML format
      if (!responseContentType?.includes('application/json')) {
        throw new WeatherApiError(`Invalid response from Weather API: got ${responseContentType}.`, response.status);
      }

      const { error } = response.data as ErrorResponse;

      if (error.code === ErrorCode.CITY_NOT_FOUND) {
        throw new CityNotFoundError();
      }

      throw new WeatherApiError(error.message, error.code);
    }

    const { current } = response.data as WeatherResponse;

    const description = `Weather in ${city}: ${current.temp_c}°C, ${current.humidity}%, ${current.condition.text}`;

    return {
      temperature: current.temp_c,
      humidity: current.humidity,
      description,
    };
  }

  async geocodeCity(city: string): Promise<Weather> {
    const { apiKey } = this.config;

    const response = await this.httpClient.get<WeatherResponse | ErrorResponse>(
      `https://api.weatherapi.com/v1/search.json`,
      {
        queryParams: {
          key: apiKey,
          q: city,
        },
        headers: {
          Accept: 'application/json',
        },
      },
    );

    if (response.status !== 200) {
      const responseContentType = response.headers.get('Content-Type');

      // In some cases, like like empty api key, the API returns response in HTML format
      if (!responseContentType?.includes('application/json')) {
        throw new WeatherApiError(`Invalid response from Weather API: got ${responseContentType}.`, response.status);
      }

      const { error } = response.data as ErrorResponse;

      if (error.code === ErrorCode.CITY_NOT_FOUND) {
        throw new CityNotFoundError();
      }

      throw new WeatherApiError(error.message, error.code);
    }

    const { current } = response.data as WeatherResponse;

    const description = `Weather in ${city}: ${current.temp_c}°C, ${current.humidity}%, ${current.condition.text}`;

    return {
      temperature: current.temp_c,
      humidity: current.humidity,
      description,
    };
  }
}
