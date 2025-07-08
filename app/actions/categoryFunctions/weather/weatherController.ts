import { Conversation, Coordinates, OpenAIResponseOutput, UserRequestDetails } from "@/app/types";
import getCurrentWeather from "./getCurrentWeather";
import openAIClient from "@/app/lib/openai";
import { getCoordinates } from "./weatherHelpers";
import functionSignatures from './weatherFunctionSignatures'

const systemMessage = `Use the weather functions and request context to respond helpfully and briefly.`

export default async function weatherFunctionController(conversation: Conversation, userRequestDetails: UserRequestDetails) {
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

    let coordinates: Coordinates;

    const openaiDefaultLocations = ['your location', 'current location', 'my location', 'user location']; //common default values returned by openai model
    
    if (location && !openaiDefaultLocations.includes(location.toLowerCase())) {
        coordinates = await getCoordinates(location);
    } else {
        if (userRequestDetails.coordinates) {
            coordinates = userRequestDetails.coordinates;
        } else {
            return 'Sorry, I could not get the weather information you asked for. Can you please provide a location?';
        }
    }

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