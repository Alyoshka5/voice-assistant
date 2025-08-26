import styles from './FutureWeatherForecastPanel.module.css'
import { FutureWeatherForecastDetails } from "@/app/types/types";

export default function FutureWeatherForecastPanel({ details }: { details: FutureWeatherForecastDetails}) {
    const date = new Date(details.displayDate);
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });
    const weekDay = formattedDate.split(',')[0];
    const monthDay = formattedDate.split(',')[1].trim();


    return (
        <div className={styles.panel}>
            <img src={`${details.weatherIcon}.png`} className={styles.icon} alt="Weather Icon"  />
            <div className={styles.primary_info}>
                <p className={styles.week_day}>{weekDay}</p>
                <p className={styles.month_day}>{monthDay}</p>
                <p className={styles.description}>{details.weatherDescription}</p>
            </div>
            <div className={styles.secondary_info}>
                <p>High: {details.maxTemperature}°</p>
                <p>Low: {details.minTemperature}°</p>
            </div>
        </div>
    );
}