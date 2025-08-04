import { DateObject } from './types';

export type Coordinates = {
    latitude?: number;
    longitude?: number;
}

export type UserRequestDetails = {
    coordinates: Coordinates | null;
    date: string;
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
    feelsLike: number,
    precipitation: number,
    humidity: number,
    windSpeed: number
}