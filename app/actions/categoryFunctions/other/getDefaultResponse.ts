import { Conversation, UserRequestDetails } from "@/app/types/types";
import openAIClient from "@/app/lib/openai";

export default async function getDefaultResponse(conversation: Conversation, userRequestDetails: UserRequestDetails) {
    const systemMessage = createSystemMessage(userRequestDetails.time, userRequestDetails.date);

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

function createSystemMessage(time: string, date: string) {
    return (
`You are a friendly voice assistant. Read the conversation and user request, and respond naturally, clearly, and briefly.
Current time: ${time}
Current date: ${date}`
)
}