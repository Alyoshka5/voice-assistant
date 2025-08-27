import openAIClient from "@/app/lib/openai";
import { auth } from "@/auth";
import { AddTaskToListDetails, TaskList, TaskListsList } from "@/app/types/types";


export default async function addTaskToList(details: AddTaskToListDetails) {
    const session = await auth();
    if (!session)
        return {outputText: 'You need to be signed in to add a task.'}

    const accessToken = session.accessToken;
    if (!accessToken)
        return {outputText: 'You need to be signed in to add a task.'}

    const taskListResponse = await fetch(`https://tasks.googleapis.com/tasks/v1/users/@me/lists`, {
        headers: {
            Authorization: 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
        }
    });
    if (!taskListResponse.ok)
        return {outputText: `Sorry, I couldn't add the task to your ${details.listName} list.`}

    const taskListData: TaskListsList = await taskListResponse.json();

    const taskListNames = taskListData.items.map((list: TaskList) => {
        return `Name: ${list.title}, ID: ${list.id}`;
    });
    
    const requestedListName = details.listName;
    if (!requestedListName)
        return {outputText: `Sorry, I can't add the task because you didn't provide a list name.`}

    
    const requestedTaskName = details.taskName;
    if (!requestedTaskName)
        return {outputText: `Sorry, I can't add the task because you didn't provide a task name.`}
    
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
        return {outputText: `Sorry, I couldn't add the task to the ${details.listName} list.`}
    }

    let taskListId = openaiResponse.output_text.trim();
    let taskListName = taskListData.items.find((list: TaskList) => list.id === taskListId)?.title;
    const openaiDefaultTaskListIds = ['', '\'\'', '""', '```plaintext\n```']
    if (openaiDefaultTaskListIds.includes(taskListId)) { // task list doesn't exist
        const taskListId = await createTaskList(requestedListName, accessToken);
        taskListName = requestedListName;
        if (taskListId === '')
            return {outputText: `Sorry, I couldn't find or create a list with the name ${requestedListName}.`}
    }

    const taskName = await addTask(accessToken, taskListId, requestedTaskName);
    if (taskName === '')
        return {outputText: `Sorry, I couldn't add the task to the ${requestedListName} list.`}

    return {outputText: `I added "${taskName}" to your ${taskListName} list`}
}

function createListIdentifierMessage(taskListNames: string[], requestedListName: string) {
    return `Given a list of task/todo list names and ids, respond with the list id of the most relevant list name based on the user's request.
    If no relevant list is found, return an empty string. Do not return anything except for the list id or an empty string.
    List Names and IDs: ${taskListNames.join('\n')}
    Requested list name: ${requestedListName}`;
}

async function createTaskList(requestedListName: string, accessToken: string) {
    const res = await fetch(`https://tasks.googleapis.com/tasks/v1/users/@me/lists`, {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: requestedListName
        })
    });
    
    if (!res.ok)
        return '';
    
    const data = await res.json();
    return data.id;
}

async function addTask(accessToken: string, taskListId: string, taskName: string) {
    const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`, {
        method: 'POST', 
        headers: {
            Authorization: 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: taskName
        })
    });

    if (!res.ok)
        return '';

    const data = await res.json()

    return data.title;
}