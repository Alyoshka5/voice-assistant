'use client'

import getOpenAIResponse from "@/app/actions/getOpenAIResponse";
import { UserRequestDetails } from "../types/types";

export default function useOpenAI() {
    const getResponse = async (request: string, userRequestDetails: UserRequestDetails) => {
        return await getOpenAIResponse(request, userRequestDetails);
    }

    return {
        getResponse
    }
}