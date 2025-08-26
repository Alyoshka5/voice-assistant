import { DateObject } from './types';

export type Coordinates = {
    latitude?: number;
    longitude?: number;
}

export type ForecastDay = {
    displayDate: {
      year: number;
      month: number;
      day: number;
    };
};

export type ForecastDetails = {
    displayDate: DateObject;
    weatherCondition: {
        description: string;
        type: string;
    };
    maxTemperature: {
        degrees: number;
        unit: string;
    };
    minTemperature: {
        degrees: number;
        unit: string;
    };
}

export type CurrentWeatherDetails = {
    weatherIcon: string,
    temperature: number,
    description: string,
    feelsLike: number,
    precipitation: number,
    windSpeed: number
}

export type FutureWeatherForecastDetails = {
    weatherIcon: string,
    maxTemperature: number,
    minTemperature: number,
    weatherDescription: string,
    displayDate: string
}