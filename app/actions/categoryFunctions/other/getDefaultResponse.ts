import { Conversation, UserRequestDetails } from "@/app/types";
import openAIClient from "@/app/lib/openai";

export default async function getDefaultResponse(conversation: Conversation, userRequestDetails: UserRequestDetails) {
    const systemMessage = `You are an AI voice assistant designed to provide helpful and accurate responses based on the user's input.`

    const openaiResponse = await openAIClient.responses.create({
        model: 'gpt-4.1-mini',
        input: [
            {role: 'system', content: systemMessage},
            ...conversation,
        ],
    });

    return {
        outputText: openaiResponse.output_text,
        action: '',
        details: {}
    };
}