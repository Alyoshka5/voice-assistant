
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

const functionSignatures = [
    getCurrentWeatherSignature
]

export default functionSignatures;