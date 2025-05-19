export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

export class CityNotFoundError extends WeatherServiceError {
  constructor() {
    super(`City not found`);
    this.name = 'CityNotFoundError';
  }
}

export class WeatherApiError extends WeatherServiceError {
  constructor(
    message: string,
    public code: number,
  ) {
    super(message);
    this.name = 'WeatherApiError';
  }
}
