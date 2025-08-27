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

const functionSignatures = [
    getAllTaskLists
]

export default functionSignatures;