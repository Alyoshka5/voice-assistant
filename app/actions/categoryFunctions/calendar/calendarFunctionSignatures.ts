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

const addEventToCalendar = {
    type: "function" as const,
    name: "addEventToCalendar",
    description: "Adds an event to a user's calendar",
    parameters: {
        type: "object",
        properties: {
            calendarName: {
                type: "string",
                default: "",
            },
            eventName: {
                type: "string",
                default: "",
            },
            relativeDate: {
                type: "string",
                description: "The date of the event in relative terms, e.g., 'today', 'tomorrow', 'next Monday'.",
                default: "today",
            },
            relativeTime: {
                type: "string",
                description: "The time of the event in relative terms, e.g., 'in 2 hours', 'at 3 PM', 'all day'.",
                default: "all day",
            },
            duration: {
                type: "string",
                description: "The duration of the event, e.g., '30 minutes', '1 hour'.",
                default: "1 hour",
            }
        },
        required: ["calendarName", "eventName", "relativeDate", "relativeTime", "duration"],
        additionalProperties: false
    },
    strict: true,
}

const getEventInformation = {
    type: "function" as const,
    name: "getEventInformation",
    description: "Gets information about a specific event from a user's calendar based on user query",
    parameters: {
        type: "object",
        properties: {
            calendarName: {
                type: "string",
                default: "",
            },
            eventName: {
                type: "string",
                default: "",
            },
        },
        required: ["calendarName", "eventName",],
        additionalProperties: false
    },
    strict: true,
}

const functionSignatures = [
    getEventsFromCalendar,
    addEventToCalendar,
    getEventInformation
]

export default functionSignatures;