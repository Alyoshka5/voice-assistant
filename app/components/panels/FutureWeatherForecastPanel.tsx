import { FutureWeatherForecastDetails } from "@/app/types/types";

export default function FutureWeatherForecastPanel({ details }: { details: FutureWeatherForecastDetails}) {
    const date = new Date(details.displayDate);
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div>
            <img src={`${details.weatherIcon}.png`} alt="Weather Icon"  />
            <h2>Weather Forecast for {formattedDate}</h2>
            <p>{details.weatherDescription}</p>
            <p>Max Temperature: {details.maxTemperature}°</p>
            <p>Min Temperature: {details.minTemperature}°</p>
        </div>
    );
}