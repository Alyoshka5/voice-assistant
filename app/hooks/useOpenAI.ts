'use client'

import getOpenAIResponse from "@/app/actions/getOpenAIResponse";

export default function useOpenAI() {
    const getResponse = async (prompt: string) => {
        return await getOpenAIResponse(prompt);
    }

    return {
        getResponse
    }
}