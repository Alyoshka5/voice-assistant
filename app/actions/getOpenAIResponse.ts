'use server'

import openAIClient from "@/app/lib/openai";

const systemMessage = `
You are a voice assistant. Classify the user's request into one of these categories:

- weather
- other

Respond with a just the category name, without any additional text or explanation.

If you're unsure, return "other". Do not extract details or guess.

`;

export default async function getOpenAIResponse(prompt: string) {
    const promptCategoryResponse = await openAIClient.responses.create({
        model: 'gpt-4.1-nano',
        input: [
            {role: 'system', content: systemMessage},
            {role: 'user', content: prompt},
        ],
    });

    const promptCategory = promptCategoryResponse.output_text;

    return promptCategory;
}