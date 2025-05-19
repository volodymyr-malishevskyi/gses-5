import { HTTPBadRequestError, HTTPNotFoundError } from '@/common/errors/http-error';
import { NextFunction, Request, Response } from 'express';
import { CityNotFoundError } from './errors/weather-service';
import { WeatherService } from './weather.service';

export class WeatherController {
  constructor(private weatherService: WeatherService) {}

  async getWeatherByCity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const city = req.query.city as string | undefined;

      if (!city) {
        throw new HTTPBadRequestError('Invalid request');
      }
      const weatherData = await this.weatherService.getWeatherByCity(city);
      res.json(weatherData);
    } catch (error) {
      if (error instanceof CityNotFoundError) return next(new HTTPNotFoundError('City not found'));
      next(error);
    }
  }
}
