import { beforeEach, afterEach } from 'vitest';
import getOpenAIResponse from './getOpenAIResponse';
import openAIClient from '@/app/lib/openai';
import { auth } from '@/auth';
import { Conversation, Coordinates, UserRequestDetails } from '@/app/types/types';
import { Role } from '@prisma/client';
import prisma from '@/app/lib/db';
import categoryControllers from './categoryFunctions/controllerExporter';

vi.mock('@/auth', () => ({
    auth: vi.fn()
}));

vi.mock('@/app/lib/openai', () => ({
    default: {
        responses: {
            create: vi.fn()
        }
    }
}));

vi.mock('@prisma/client', () => ({
    Role: {
        user: 'user',
        assistant: 'assistant'
    }
}));

vi.mock('@/app/lib/db', () => ({
    default: {
        message: {
            findMany: vi.fn(),
            create: vi.fn()
        }
    }
}));

vi.mock('./categoryFunctions/controllerExporter', () => ({
    default: {
        'weather': vi.fn(),
        'youtube': vi.fn(),
        'tasks/todo': vi.fn(),
        'calendar': vi.fn(),
        'other': vi.fn(),
    }
}));

describe('getOpenAIResponse', () => {
    const mockRequest = 'user request';
    const mockUserEmail = 'useremail@domain.com';

    const mockPrismaPreviousMessages = [
        {
            role: Role.assistant,
            content: 'assistant message',
            id: 'assistant message id',
            userId: 'assistant id',
            createdAt: new Date(),
        },
        {
            role: Role.user,
            content: 'user message',
            id: 'user message id',
            userId: 'user id',
            createdAt: new Date(),
        },
    ]
    
    const mockConversation: Conversation = [
        {
            role: Role.user,
            content: 'user message',
        },
        {
            role: Role.assistant,
            content: 'assistant message',
        }
    ]

    const mockCoordinates: Coordinates = {
        latitude: 23.283412,
        longitude: -38.102932
    }

    const mockUserRequestDetails: UserRequestDetails = {
        coordinates: mockCoordinates,
        date: "Wednesday, December 19, 2025",
        time: "2:30 PM",
        isoNow: "2025-12-19T14:30:00.000Z",
        timeZone: "America/Vancouver",
    }

    beforeEach(() => {
        vi.clearAllMocks();
        
        vi.mocked(auth).mockResolvedValue({
            accessToken: 'abdef',
            user: { 
                name: 'Test User',
                email: mockUserEmail
            }
        } as any)

        vi.mocked(prisma.message.findMany).mockResolvedValue(mockPrismaPreviousMessages);
    })

    afterEach(() => {
        vi.resetAllMocks();
    })

    it('returns error message when user not signed in', async () => {
        vi.mocked(auth).mockResolvedValue(null as any);

        const result = await getOpenAIResponse(mockRequest, mockUserRequestDetails);

        expect(result.outputText).toMatch(/sign.*in/i);
    })

    it('executes correct category controller and returns data', async () => {
        const mockFinalControllerResponse = {
            outputText: 'weather output text',
            action: 'displayForecastWeatherTab',
            details: {
                maxTemperature: 20,
                minTemperature: 10,
            }
        }
        const mockControllerResponse = { 
            ...mockFinalControllerResponse,
            databaseText: 'weather database text'
        }
        vi.mocked(openAIClient.responses.create).mockResolvedValue({
            output_text: 'weather'
        } as any);
        vi.mocked(categoryControllers['weather']).mockResolvedValue(mockControllerResponse);

        const response = await getOpenAIResponse(mockRequest, mockUserRequestDetails);

        expect(openAIClient.responses.create).toHaveBeenCalledWith(expect.objectContaining({
            input: expect.arrayContaining([
                expect.objectContaining({role: 'system'}),
                expect.objectContaining({role: 'user', content: mockRequest})
            ]),
        }));
        expect(categoryControllers['weather']).toHaveBeenCalledWith(
            [...mockConversation, { role: Role.user, content: mockRequest }],
            mockUserRequestDetails
        );
        expect(categoryControllers['other']).not.toHaveBeenCalled();
        expect(prisma.message.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                role: Role.user,
                content: mockRequest,
                user: {
                    connect: {
                        email: mockUserEmail
                    }
                }
            })
        }));
        expect(prisma.message.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                role: Role.assistant,
                content: 'weather database text',
                user: {
                    connect: {
                        email: mockUserEmail
                    }
                }
            })
        }));
        expect(response.databaseText).toBe(undefined);
        expect(response).toEqual(mockFinalControllerResponse);
    })

    it('calls "other" controller when OpenAI API returns invalid category', async () => {
        const mockControllerResponse = {
            outputText: 'other output text',
        }
        vi.mocked(openAIClient.responses.create).mockResolvedValue({
            output_text: 'invalid category'
        } as any);
        vi.mocked(categoryControllers['other']).mockResolvedValue(mockControllerResponse);

        await getOpenAIResponse(mockRequest, mockUserRequestDetails);

        expect(categoryControllers['other']).toHaveBeenCalledWith(
            [...mockConversation, { role: Role.user, content: mockRequest }],
            mockUserRequestDetails
        );
    })

    it('handles OpenAI API errors', async () => {
        vi.mocked(openAIClient.responses.create).mockRejectedValue(new Error('API Error'));

        const result = await getOpenAIResponse(mockRequest, mockUserRequestDetails);

        expect(result.outputText).toMatch(/sorry/i);
    });
})