
const getCurrentWeatherSignature = {
    type: "function" as const,
    name: "getCurrentWeather",
    description: "Fetches the current weather for a given location.",
    parameters: {
        type: "object",
        properties: {
            location: {
                type: "string",
                description: "Default location is ''"
            }
        },
        required: ["location"],
        additionalProperties: false
    },
    strict: true,
}

const getWeatherForecastSignature = {
    type: "function" as const,
    name: "getFutureWeatherForecast",
    description: "Fetches the future weather forecast for a given location.",
    parameters: {
        type: "object",
        properties: {
            location: {
                type: "string",
                description: "Default location is ''"
            },
            date: {
                type: "object",
                properties: {
                    year: {
                        type: "number",
                        description: "Year of the date"
                    },
                    month: {
                        type: "number",
                        description: "Month of the date"
                    },
                    day: {
                        type: "number",
                        description: "Day of the date"
                    }
                },
                required: ["year", "month", "day"],
                additionalProperties: false
            }
        },
        required: ["location", "date"],
        additionalProperties: false
    },
    strict: true,
}

const functionSignatures = [
    getCurrentWeatherSignature,
    getWeatherForecastSignature
]

export default functionSignatures;