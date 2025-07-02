import { Conversation } from "@/app/types";
import { getCurrentWeatherSignature } from "./getCurrentWeather";
import openAIClient from "@/app/lib/openai";

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

}