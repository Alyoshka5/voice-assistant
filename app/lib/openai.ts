import openAI from "openai";

const openAIClient = new openAI({
    apiKey: process.env.OPENAI_API_KEY,
    fetch: (...args) => fetch(...args),
});

export default openAIClient;