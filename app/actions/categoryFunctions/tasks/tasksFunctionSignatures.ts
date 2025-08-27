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
    description: "Creates and adds a new task/todo to a specified list",
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

const functionSignatures = [
    getAllTaskLists,
    createTaskList,
    addTaskToList,
    getTasksFromList
]

export default functionSignatures;