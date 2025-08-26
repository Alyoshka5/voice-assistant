import styles from './CurrentWeatherPanel.module.css'
import { CurrentWeatherDetails } from "@/app/types/types";

export default function CurrentWeatherPanel({ details }: { details: CurrentWeatherDetails}) {
    return (
        <div className={styles.panel}>
            <img src={`${details.weatherIcon}.png`} alt="Weather Icon"  />
            <h2>Current Weather</h2>
            <p>Temperature: {details.temperature}°</p>
            <p>Temperature: {details.description}</p>
            <p>Feels Like: {details.feelsLike}°</p>
            <p>Precipitation: {details.precipitation}%</p>
            <p>Wind Speed: {details.windSpeed} m/s</p>
        </div>
    );
}