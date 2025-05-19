import { HttpClient } from '@/common/http-client';
import { IWeatherApiService, Weather } from '@/common/interfaces/weather-api-service';
import { CityNotFoundError, WeatherApiError } from './errors/weather-api';
import { ErrorCode, ErrorResponse, WeatherResponse } from './types/weather-api';

export interface WeatherApiServiceConfig {
  apiKey: string;
}

export class WeatherApiService implements IWeatherApiService {
  constructor(
    private httpClient: HttpClient,
    private config: WeatherApiServiceConfig,
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

    const { current, location } = response.data as WeatherResponse;

    return {
      city: location.name,
      humidity: current.humidity,
      temperature: {
        c: current.temp_c,
        f: current.temp_f,
      },
      shortDescription: current.condition.text,
    };
  }
}
