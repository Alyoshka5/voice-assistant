import { Conversation, Coordinates } from "@/app/types/types";
import openAIClient from "@/app/lib/openai";
import { auth } from "@/auth";

const systemMessage = `
You are a friendly voice assistant. Read the weather data and user request, and respond naturally, clearly, and briefly.
Weather Data: `;

export default async function getCurrentWeather(coordinates: Coordinates, conversation: Conversation) {
    const session = await auth();
    if (!session)
        return {outputText: 'You need to be signed in to check your calendar events.'}

    const accessToken = session.accessToken;
    if (!accessToken)
        return {outputText: 'You need to be signed in to check your calendar events.'}
    
    const apiKey = process.env.GOOGLE_WEATHER_API_KEY;
    const url = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${apiKey}&location.latitude=${coordinates.latitude}&location.longitude=${coordinates.longitude}`;
  
    const weatheRresponse = await fetch(url);
    if (!weatheRresponse.ok)
        return {outputText: `Sorry, I couldn't get the current weather.`}

    const weatherData = await weatheRresponse.json();

    weatherData.temperature.degrees = Math.round(weatherData.temperature.degrees);
    weatherData.feelsLikeTemperature.degrees = Math.round(weatherData.feelsLikeTemperature.degrees);
    weatherData.dewPoint.degrees = Math.round(weatherData.dewPoint.degrees);
    weatherData.heatIndex.degrees = Math.round(weatherData.heatIndex.degrees);
    weatherData.windChill.degrees = Math.round(weatherData.windChill.degrees);
    
    let openaiResponse 
    try {
        openaiResponse = await openAIClient.responses.create({
            model: "gpt-4.1-nano",
            input: [
                {role: 'system', content: systemMessage + JSON.stringify(weatherData)},
                ...conversation,
            ],
        });
        if (openaiResponse.error)
            throw new Error(openaiResponse.error.message);
    } catch (error) {
        return {outputText: `Sorry, I couldn't get the current weather.`}
    }

    return {
        outputText: openaiResponse.output_text,
        action: 'displayCurrentWeatherTab',
        details: {
            weatherIcon: weatherData.weatherCondition.iconBaseUri,
            description: weatherData.weatherCondition.description.text,
            temperature: weatherData.temperature.degrees,
            feelsLike: weatherData.feelsLikeTemperature.degrees,
            precipitation: weatherData.precipitation.probability.percent,
            windSpeed: weatherData.wind.speed.value
        }
    };
}