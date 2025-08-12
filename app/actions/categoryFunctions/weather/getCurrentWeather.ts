import { Conversation, Coordinates } from "@/app/types/types";
import openAIClient from "@/app/lib/openai";

const systemMessage = `
You are a friendly voice assistant. Read the weather data and user request, and respond naturally, clearly, and briefly.
Weather Data: `;

export default async function getCurrentWeather(coordinates: Coordinates, conversation: Conversation) {
    const apiKey = process.env.GOOGLE_WEATHER_API_KEY;
    const url = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${apiKey}&location.latitude=${coordinates.latitude}&location.longitude=${coordinates.longitude}`;
  
    const weatheRresponse = await fetch(url);
    const weatherData = await weatheRresponse.json();

    weatherData.temperature.degrees = Math.round(weatherData.temperature.degrees);
    weatherData.feelsLikeTemperature.degrees = Math.round(weatherData.feelsLikeTemperature.degrees);
    weatherData.dewPoint.degrees = Math.round(weatherData.dewPoint.degrees);
    weatherData.heatIndex.degrees = Math.round(weatherData.heatIndex.degrees);
    weatherData.windChill.degrees = Math.round(weatherData.windChill.degrees);
    
    const openaiResponse = await openAIClient.responses.create({
        model: "gpt-4.1-nano",
        input: [
            {role: 'system', content: systemMessage + JSON.stringify(weatherData)},
            ...conversation,
        ],
    });

    return {
        outputText: openaiResponse.output_text,
        action: 'displayCurrentWeatherTab',
        details: {
            weatherIcon: weatherData.weatherCondition.iconBaseUri,
            temperature: weatherData.temperature.degrees,
            feelsLike: weatherData.feelsLikeTemperature.degrees,
            precipitation: weatherData.precipitation.probability.percent,
            humidity: weatherData.relativeHumidity,
            windSpeed: weatherData.wind.speed.value
        }
    };
}