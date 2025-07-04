import { Conversation, Coordinates, OpenAIResponseOutput } from "@/app/types";
import { getCurrentWeatherSignature, getCurrentWeather } from "./getCurrentWeather";
import openAIClient from "@/app/lib/openai";
import { getCoordinates } from "./weatherHelpers";

const functionSignatures = [
    getCurrentWeatherSignature,
]

const systemMessage = `Use the weather functions and request context to respond helpfully and briefly.`

export default async function weatherFunctionController(conversation: Conversation) {
    const openaiResponse = await openAIClient.responses.create({
        model: 'gpt-4.1-nano',
        input: [
            { role: 'system', content: systemMessage },
            ...conversation,
        ],
        tools: functionSignatures
    });

    let output: OpenAIResponseOutput = openaiResponse.output[0];
    const args = JSON.parse(output.arguments || '{}');
    const location: string = args?.location;
    
    if (!location) {
        return 'Please provide a location.';
    }
    
    const coordinates: Coordinates = await getCoordinates(location);

    if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
        return 'Sorry, I could not find the location you requested. Please try again with a different location.';
    }

    const functionName = output.name;
    
    switch (functionName) {
        case 'getCurrentWeather':
            return await getCurrentWeather(coordinates, conversation);

        default:
            return ''
    }
}