import { Conversation, OpenAIResponseOutput, UserRequestDetails } from "@/app/types";
import openAIClient from "@/app/lib/openai";
import functionSignatures from './youtubeFunctionSignatures'

const systemMessage = `Use the youtube functions and request context to respond helpfully and briefly.`

export default async function youtubeFunctionController(conversation: Conversation, userRequestDetails: UserRequestDetails) {
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

    const functionName = output.name;
    
    switch (functionName) {

        default:
            return {
                outputText: `Sorry, I don't understand your request. Please try again with a different question.`,
                action: '',
                details: {}
            }
    }
}