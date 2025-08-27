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

const functionSignatures = [
    getAllTaskLists,
    createTaskList
]

export default functionSignatures;