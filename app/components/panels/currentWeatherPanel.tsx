import { CurrentWeatherDetails } from "@/app/types/types";

export default function CurrentWeatherPanel({ details }: { details: CurrentWeatherDetails}) {
    return (
        <div>
            <img src={`${details.weatherIcon}.png`} alt="Weather Icon"  />
            <h2>Current Weather</h2>
            <p>Temperature: {details.temperature}°</p>
            <p>Feels Like: {details.feelsLike}°</p>
            <p>Precipitation: {details.precipitation}%</p>
            <p>Humidity: {details.humidity}%</p>
            <p>Wind Speed: {details.windSpeed} m/s</p>
        </div>
    );
}