const getAllTaskLists = {
    type: "function" as const,
    name: "getAllTaskLists",
    description: "Gets a list of all task/todo lists",
    parameters: {
        type: "object",
        properties: {},
        additionalProperties: false
    },
    strict: true,
}

const createTaskList = {
    type: "function" as const,
    name: "createTaskList",
    description: "Creates a new task/todo list",
    parameters: {
        type: "object",
        properties: {
            title: {
                type: "string",
                description: "The title of the new task list",
            },
        },
        required: ["title"],
        additionalProperties: false
    },
    strict: true,
}

const addTaskToList = {
    type: "function" as const,
    name: "addTaskToList",
    description: "Adds a new task to an existing task list. Use this whenever the user asks to add or create a task inside a list.",
    parameters: {
        type: "object",
        properties: {
            taskName: {
                type: "string",
                description: "The name of the new task",
            },
            listName: {
                type: "string",
                description: "The name of the list to add the task to",
            }
        },
        required: ["taskName", "listName"],
        additionalProperties: false
    },
    strict: true,
}

const getTasksFromList = {
    type: "function" as const,
    name: "getTasksFromList",
    description: "Gets all tasks from a specified task/todo list",
    parameters: {
        type: "object",
        properties: {
            listName: {
                type: "string",
                description: "The name of the list to add the task to",
            }
        },
        required: ["listName"],
        additionalProperties: false
    },
    strict: true,
}

const completeTaskInList = {
    type: "function" as const,
    name: "completeTaskInList",
    description: "Marks a task as complete in a specified task/todo list",
    parameters: {
        type: "object",
        properties: {
            taskName: {
                type: "string",
                description: "The name of the task to complete",
            },
            listName: {
                type: "string",
                description: "The name of the list to add the task to",
            }
        },
        required: ["taskName", "listName"],
        additionalProperties: false
    },
    strict: true,
}

const functionSignatures = [
    getAllTaskLists,
    createTaskList,
    addTaskToList,
    getTasksFromList,
    completeTaskInList
]

export default functionSignatures;