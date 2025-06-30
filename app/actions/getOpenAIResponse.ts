'use server'

import openAIClient from "@/app/lib/openai";

export default async function getOpenAIResponse(prompt: string) {
    const response = await openAIClient.responses.create({
        model: 'gpt-4.1-nano',
        input: prompt,
    });

    return response.output_text;
}