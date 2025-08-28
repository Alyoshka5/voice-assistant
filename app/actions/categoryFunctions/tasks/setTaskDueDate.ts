import openAIClient from "@/app/lib/openai";
import { auth } from "@/auth";
import { TaskList, TaskListsList, TaskItem, TaskDetails } from "@/app/types/types";


export default async function setTaskDueDate(details: TaskDetails) {
    const session = await auth();
    if (!session)
        return {outputText: 'You need to be signed in to set a due date.'}

    const accessToken = session.accessToken;
    if (!accessToken)
        return {outputText: 'You need to be signed in to set a due date.'}

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
    
    const requestedListName = details.listName;
    if (!requestedListName)
        return {outputText: `Sorry, I can't find any tasks because you didn't provide a list name.`}

    const requestedTaskName = details.taskName;
    if (!requestedTaskName)
        return {outputText: `Sorry, I can't set a due date because you didn't provide a task name.`}

    const requestedDueDate = details.dueDate;
    if (!requestedDueDate)
        return {outputText: `Sorry, I can't set a due date because you didn't provide a date.`}
    
    const taskListIdentifierMessage = createListIdentifierMessage(taskListNames, requestedListName);
    let openaiListResponse;
    try {
        openaiListResponse = await openAIClient.responses.create({
            model: "gpt-4.1-nano",
            input: taskListIdentifierMessage
        });
        if (openaiListResponse.error)
            throw new Error(openaiListResponse.error.message);
    } catch (error) {
        return {outputText: `Sorry, I couldn't set a due date for your task.`}
    }
    
    let taskListId = openaiListResponse.output_text.trim();
    const openaiDefaultTaskListIds = ['', '\'\'', '""', '```plaintext\n```']
    if (openaiDefaultTaskListIds.includes(taskListId)) { // task list doesn't exist
        return {outputText: `Sorry, I couldn't find a list with the name ${requestedListName}.`}
    }
    
    const listTasks = await getTasks(accessToken, taskListId);
    if (listTasks === '')
        return {outputText: `Sorry, I couldn't find your tasks.`}
    
    const taskNames = listTasks.items.map((task: TaskItem) => {
        return `Name: ${task.title}, ID: ${task.id}`;
    });

    const taskIdentifierMessage = createTaskIdentifierMessage(taskNames, requestedTaskName);
    let openaiTaskResponse;
    try {
        openaiTaskResponse = await openAIClient.responses.create({
            model: "gpt-4.1-nano",
            input: taskIdentifierMessage
        });
        if (openaiTaskResponse.error)
            throw new Error(openaiTaskResponse.error.message);
    } catch (error) {
        return {outputText: `Sorry, I couldn't set a due date for your task.`}
    }

    let taskId = openaiTaskResponse.output_text.trim();
    if (openaiDefaultTaskListIds.includes(taskId)) { // task doesn't exist
        return {outputText: `Sorry, I couldn't find a task with the name ${requestedTaskName}.`}
    }

    const dueDateObject = new Date(`${requestedDueDate.month}/${requestedDueDate.day}/${requestedDueDate.year}`);
    const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
            Authorization: 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            due: dueDateObject.toISOString()
        }),
    });
    if (!res.ok)
        return {outputText: `Sorry, I couldn't set a due date for your task.`}

    const taskName = listTasks.items.find((task: TaskItem) => task.id === taskId)?.title;
    const readableDate = dueDateObject.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });

    return {outputText: `I set the due date for "${taskName}" to ${readableDate}.`}
}

function createListIdentifierMessage(taskListNames: string[], requestedListName: string) {
    return `Given a list of task/todo list names and ids, respond with the list id of the most relevant list name based on the user's request.
    If no relevant list is found, return an empty string. Do not return anything except for the list id or an empty string.
    List Names and IDs: ${taskListNames.join('\n')}
    Requested list name: ${requestedListName}`;
}

function createTaskIdentifierMessage(taskNames: string[], requestedTaskName: string) {
    return `Given a list of task/todo item names and ids, respond with the task id of the most relevant task name based on the user's request.
    If no relevant task is found, return an empty string. Do not return anything except for the task id or an empty string.
    Task Names and IDs: ${taskNames.join('\n')}
    Requested task name: ${requestedTaskName}`;
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