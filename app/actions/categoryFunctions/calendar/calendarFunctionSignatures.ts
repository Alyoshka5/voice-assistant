const getEventsFromCalendar = {
    type: "function" as const,
    name: "getEventsFromCalendar",
    description: "Gets all events from the user's primary calendar",
    parameters: {
        type: "object",
        properties: {
            calendarName: {
                type: "string",
                description: "The name of the calendar to get events from",
            }
        },
        required: ["calendarName"],
        additionalProperties: false
    },
    strict: true,
}

const functionSignatures = [
    getEventsFromCalendar
]

export default functionSignatures;