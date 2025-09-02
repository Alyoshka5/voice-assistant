import { Conversation, OpenAIResponseOutput, UserRequestDetails } from "@/app/types/types";
import openAIClient from "@/app/lib/openai";
import functionSignatures from './calendarFunctionSignatures';
import getEventsFromCalendar from "./getEventsFromCalendar";
import addEventToCalendar from "./addEventToCalendar";

const systemMessage = `
You are a calendar management assistant. 
The user will ask you to manage their calendars. 
Always respond by selecting the most direct function that matches the request. 
Never answer questions about calendars or events from memory — always call a function so the information is fresh and correct.
Right now is `


export default async function tasksFunctionController(conversation: Conversation, userRequestDetails: UserRequestDetails) {
    const openaiResponse = await openAIClient.responses.create({
        model: 'gpt-4.1-mini',
        input: [
            { role: 'system', content: systemMessage + userRequestDetails.date + ' ' + userRequestDetails.time },
            ...conversation,
        ],
        tools: functionSignatures
    });

    let output: OpenAIResponseOutput = openaiResponse.output[0];
    const args = JSON.parse(output.arguments || '{}');

    const functionName = output.name;
    
    switch (functionName) {
        case 'getEventsFromCalendar':
            return await getEventsFromCalendar(args.calendarName, userRequestDetails.date, userRequestDetails.time);

        case 'addEventToCalendar':
            return await addEventToCalendar(args, userRequestDetails.isoNow, userRequestDetails.timeZone);

        default:
            return {
                outputText: `Sorry, I don't understand your request. Please try again with a different question.`,
                action: '',
                details: {}
            }
    }
}