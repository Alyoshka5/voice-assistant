'use server'

import { Conversation, Coordinates, ForecastDay, ForecastDetails, DateObject} from "@/app/types/types";
import openAIClient from "@/app/lib/openai";


const systemMessage = `
You are a friendly voice assistant. Read the weather data and user request, and respond naturally, clearly, and briefly.
Weather Data: `;

export default async function getWeatherForecast(coordinates: Coordinates, conversation: Conversation, targetDate: DateObject) {
    const apiKey = process.env.GOOGLE_WEATHER_API_KEY;
    const days = 5;
    const url = `https://weather.googleapis.com/v1/forecast/days:lookup?key=${apiKey}&location.latitude=${coordinates.latitude}&location.longitude=${coordinates.longitude}&days=${days}`;
  
    const weatheRresponse = await fetch(url);
    const weatherData = await weatheRresponse.json();

    const targetDateForecast = weatherData.forecastDays.find((forecastDay: ForecastDay) => {
        const date = forecastDay.displayDate;
        return date.year == targetDate.year && date.month == targetDate.month && date.day == targetDate.day;
    });

    if (!targetDateForecast)
        return {outputText: `Sorry, I couldn't find the weather forecast for the specified day.`}

    const forecastDetails: ForecastDetails = {
        displayDate: targetDateForecast.displayDate,
        weatherCondition: {
            description: targetDateForecast.daytimeForecast.weatherCondition.description.text,
            type: targetDateForecast.daytimeForecast.weatherCondition.type,
        },
        maxTemperature: targetDateForecast.maxTemperature,
        minTemperature: targetDateForecast.minTemperature,
    }
    forecastDetails.maxTemperature.degrees = Math.round(forecastDetails.maxTemperature.degrees);
    forecastDetails.minTemperature.degrees = Math.round(forecastDetails.minTemperature.degrees);

    const openaiResponse = await openAIClient.responses.create({
        model: "gpt-4.1-nano",
        input: [
            {role: 'system', content: systemMessage + JSON.stringify(forecastDetails)},
            ...conversation,
        ],
    });
    
    return {
        outputText: openaiResponse.output_text,
        action: 'displayForecastWeatherTab',
        details: {
            weatherIcon: targetDateForecast.daytimeForecast.weatherCondition.iconBaseUri,
            maxTemperature: forecastDetails.maxTemperature.degrees,
            minTemperature: forecastDetails.minTemperature.degrees,
            weatherDescription: forecastDetails.weatherCondition.description,
        }
    }
}