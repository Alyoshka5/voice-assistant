import { Conversation, OpenAIResponseOutput, UserRequestDetails } from "@/app/types/types";
import openAIClient from "@/app/lib/openai";
import functionSignatures from './tasksFunctionSignatures'
import getAllTaskLists from "./getAllTaskLists";
import createTaskList from "./createTaskList";
import addTaskToList from "./addTaskToList";
import getTasksFromList from "./getTasksFromList";
import completeTaskInList from "./completeTaskInList";
import setTaskDueDate from "./setTaskDueDate";

const systemMessage = `
You are a task management assistant. 
The user will ask you to manage tasks. 
Always respond by selecting the most direct function that matches the request. 
Never answer questions about tasks or lists from memory — always call a function so the information is fresh and correct.
Today is `


export default async function tasksFunctionController(conversation: Conversation, userRequestDetails: UserRequestDetails) {
    let openaiResponse;
    try {
        openaiResponse = await openAIClient.responses.create({
            model: 'gpt-4.1-mini',
            input: [
                { role: 'system', content: systemMessage + userRequestDetails.date },
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
        case 'getAllTaskLists':
            return await getAllTaskLists();

        case 'createTaskList':
            return await createTaskList(args.title);

        case 'addTaskToList':
            return await addTaskToList(args);

        case 'getTasksFromList':
            return await getTasksFromList(args.listName)

        case 'completeTaskInList':
            return await completeTaskInList(args);

        case 'setTaskDueDate':
            return await setTaskDueDate(args);

        default:
            return {
                outputText: `Sorry, I don't understand your request. Please try again with a different question.`,
                action: '',
                details: {}
            }
    }
}