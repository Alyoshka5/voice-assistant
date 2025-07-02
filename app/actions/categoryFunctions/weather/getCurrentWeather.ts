import { Conversation, Coordinates } from "@/app/types";
import openAIClient from "@/app/lib/openai";

const getCurrentWeatherSignature = {
    type: "function" as const,
    name: "getCurrentWeather",
    description: "Fetches the current weather for a given location.",
    parameters: {
        type: "object",
        properties: {
            location: {
                type: "string",
                description: "Default location is ''"
            }
        },
        required: ["location"],
        additionalProperties: false
    },
    strict: true,
}

const systemMessage = `
You are a friendly voice assistant. Read the weather data and user request, and respond naturally, clearly, and briefly.
Weather Data: `;

async function getCurrentWeather(coordinates: Coordinates, conversation: Conversation) {
    const apiKey = process.env.GOOGLE_WEATHER_API_KEY;
    const url = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${apiKey}&location.latitude=${coordinates.latitude}&location.longitude=${coordinates.longitude}`;
  
    const weatheRresponse = await fetch(url);
    const weatherData = await weatheRresponse.json();
    
    const openaiResponse = await openAIClient.responses.create({
        model: "gpt-4.1-nano",
        input: [
            {role: 'system', content: systemMessage + JSON.stringify(weatherData)},
            ...conversation,
        ],
    });

    return openaiResponse.output_text
}

export { getCurrentWeatherSignature, getCurrentWeather };