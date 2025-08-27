import openAIClient from "@/app/lib/openai";
import { auth } from "@/auth";
import { TaskList, TaskListsList, TaskItem } from "@/app/types/types";


export default async function getTasksFromList(listName: string) {
    const session = await auth();
    if (!session)
        return {outputText: 'You need to be signed in to check your tasks.'}

    const accessToken = session.accessToken;
    if (!accessToken)
        return {outputText: 'You need to be signed in to check your tasks.'}

    const taskListResponse = await fetch(`https://tasks.googleapis.com/tasks/v1/users/@me/lists`, {
        headers: {
            Authorization: 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
        }
    });
    if (!taskListResponse.ok)
        return {outputText: `Sorry, I couldn't find your tasks.`}

    const taskListData: TaskListsList = await taskListResponse.json();

    const taskListNames = taskListData.items.map((list: TaskList) => {
        return `Name: ${list.title}, ID: ${list.id}`;
    });
    
    const requestedListName = listName;
    if (!requestedListName)
        return {outputText: `Sorry, I can't find any tasks because you didn't provide a list name.`}
    
    const taskListIdentifierMessage = createListIdentifierMessage(taskListNames, requestedListName);
    let openaiResponse;
    try {
        openaiResponse = await openAIClient.responses.create({
            model: "gpt-4.1-nano",
            input: taskListIdentifierMessage
        });
        if (openaiResponse.error)
            throw new Error(openaiResponse.error.message);
    } catch (error) {
        return {outputText: `Sorry, I couldn't add the task to the ${requestedListName} list.`}
    }

    let taskListId = openaiResponse.output_text.trim();
    let taskListName = taskListData.items.find((list: TaskList) => list.id === taskListId)?.title;
    const openaiDefaultTaskListIds = ['', '\'\'', '""', '```plaintext\n```']
    if (openaiDefaultTaskListIds.includes(taskListId)) { // task list doesn't exist
        return {outputText: `Sorry, I couldn't find a list with the name ${requestedListName}.`}
    }

    const listTasks = await getTasks(accessToken, taskListId);
    if (listTasks === '')
        return {outputText: `Sorry, I couldn't find your tasks.`}

    const tasks = listTasks.items.map((task: TaskItem) => task.title);
    const tasksString = [tasks.slice(0, -1).join(', '), tasks.slice(-1)[0]].join(tasks.length == 2 ? ' and ' : tasks.length < 2 ? '' : ', and ')

    return {outputText: tasks.length > 0 ? `Your tasks in ${taskListName} are: ${tasksString}.` : `You have no tasks in your ${taskListName} list.`}
}

function createListIdentifierMessage(taskListNames: string[], requestedListName: string) {
    return `Given a list of task/todo list names and ids, respond with the list id of the most relevant list name based on the user's request.
    If no relevant list is found, return an empty string. Do not return anything except for the list id or an empty string.
    List Names and IDs: ${taskListNames.join('\n')}
    Requested list name: ${requestedListName}`;
}

async function getTasks(accessToken: string, taskListId: string) {
    const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`, {
        headers: {
            Authorization: 'Bearer ' + accessToken,
        }
    });
    
    if (!res.ok)
        return '';
    
    const data = await res.json();
    return data
}