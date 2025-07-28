'use server'

import openAIClient from "@/app/lib/openai";
import prisma from "@/app/lib/db";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import categoryControllers from "./categoryFunctions/controllerExporter";
import { UserRequestDetails } from "../types";

const systemMessage = `
You are a voice assistant. Classify the user's request into one of these categories:

- weather
- other

Respond with a just the category name, without any additional text or explanation.

If you're unsure, return "other". Do not extract details or guess.
`;

export default async function getOpenAIResponse(request: string, userRequestDetails: UserRequestDetails) {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) return '';

    const requestCategoryResponse = await openAIClient.responses.create({
        model: 'gpt-4.1-nano',
        input: [
            {role: 'system', content: systemMessage},
            {role: 'user', content: request},
        ],
    });

    const requestCategory = requestCategoryResponse.output_text;

    const previousMessages = await prisma.message.findMany({
        where: {
            user: {
                email: userEmail,
            },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
    });

    const conversation = previousMessages.map(message => ({
        role: message.role,
        content: message.content,
    }));
    conversation.push({
        role: 'user',
        content: request,
    });
    const categoryController = categoryControllers[requestCategory];
    const openaiResponse = await categoryController(conversation, userRequestDetails);

    await prisma.message.create({
        data: {
            role: Role.user,
            content: request,
            user: {
                connect: {
                    email: userEmail
                }
            }
        },
    });

    await prisma.message.create({
        data: {
            role: Role.assistant,
            content: openaiResponse.outputText,
            user: {
                connect: {
                    email: userEmail
                }
            }
        },
    });

    return openaiResponse;
}