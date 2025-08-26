import styles from './CurrentWeatherPanel.module.css'
import { CurrentWeatherDetails } from "@/app/types/types";

export default function CurrentWeatherPanel({ details }: { details: CurrentWeatherDetails}) {
    return (
        <div className={styles.panel}>
            <img src={`${details.weatherIcon}.png`} className={styles.icon} alt="Weather Icon"  />
            <div className={styles.primary_info}>
                <p className={styles.temperature}>{details.temperature}°</p>
                <p className={styles.description}>{details.description}</p>
            </div>
            <div className={styles.secondary_info}>
                <p>Feels Like: {details.feelsLike}°</p>
                <p>Precipitation: {details.precipitation}%</p>
                <p>Wind Speed: {details.windSpeed} m/s</p>
            </div>
        </div>
    );
}