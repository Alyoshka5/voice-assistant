'use client'

import getOpenAIResponse from "@/app/actions/getOpenAIResponse";

export default function useOpenAI() {
    const getResponse = async (request: string) => {
        return await getOpenAIResponse(request);
    }

    return {
        getResponse
    }
}