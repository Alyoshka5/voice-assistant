import { Conversation, OpenAIResponseOutput, UserRequestDetails } from "@/app/types/types";
import openAIClient from "@/app/lib/openai";
import functionSignatures from './youtubeFunctionSignatures'
import addVideoToPlaylist from "./addVideoToPlaylist";
import findYoutubeVideo from "./findYoutubeVideo";

const systemMessage = `Use the youtube functions and request context to respond helpfully and briefly.`

export default async function youtubeFunctionController(conversation: Conversation, userRequestDetails: UserRequestDetails) {
    let openaiResponse;
    try {
        openaiResponse = await openAIClient.responses.create({
            model: 'gpt-4.1-nano',
            input: [
                { role: 'system', content: systemMessage },
                ...conversation,
            ],
            tools: functionSignatures
        });
        if (openaiResponse.error)
            throw new Error(openaiResponse.error.message);
    } catch (error) {
        return {outputText: `Sorry, I ran into a problem while trying to process your request.`}
    }

    let output: OpenAIResponseOutput = openaiResponse.output[0];
    const args = JSON.parse(output.arguments || '{}');

    const functionName = output.name;
    
    switch (functionName) {
        case 'addVideoToPlaylist':
            return await addVideoToPlaylist(conversation, args);

        case 'findYoutubeVideo':
            return await findYoutubeVideo(args.videoQuery);

        default:
            return {
                outputText: `Sorry, I don't understand your request. Please try again with a different question.`,
                action: '',
                details: {}
            }
    }
}