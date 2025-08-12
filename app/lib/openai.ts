import openAI from "openai";

const openAIClient = new openAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default openAIClient;