import { afterEach } from 'vitest';
import weatherFunctionController from './weatherController';
import openAIClient from '@/app/lib/openai';
import { Conversation, Coordinates, UserRequestDetails } from '@/app/types/types';
import getCurrentWeather from "./getCurrentWeather";
import getWeatherForecast from "./getFutureWeatherForecast";
import { getCoordinates } from './weatherHelpers';

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

vi.mock('./weatherHelpers', () => ({
    getCoordinates: vi.fn()
}));

vi.mock('./getCurrentWeather', () => ({ default: vi.fn() }));
vi.mock('./getFutureWeatherForecast', () => ({ default: vi.fn() }));

describe('weatherFunctionController', () => {
    const mockConversation: Conversation = [
        {
            role: 'user',
            content: 'user message',
        },
    ]

    const mockCoordinates: Coordinates = {
        latitude: 23.283412,
        longitude: -38.102932
    }

    const mockedUserRequestDetails: UserRequestDetails = {
        coordinates: mockCoordinates,
        date: "Wednesday, December 19, 2025",
        time: "2:30 PM",
        isoNow: "2025-12-19T14:30:00.000Z",
        timeZone: "America/Vancouver",
    }

    afterEach(() => {
        vi.resetAllMocks();
    })

    it('calls openAI API with correct arguments', async () => {
        vi.mocked(openAIClient.responses.create).mockResolvedValue({
            output: [
                { name: 'weather function name' }
            ]
        } as any);

        await weatherFunctionController(mockConversation, mockedUserRequestDetails);

        expect(openAIClient.responses.create).toHaveBeenCalledWith(expect.objectContaining({
            input: expect.arrayContaining([
                expect.objectContaining({role: 'system'}),
                ...mockConversation
            ]),
            tools: expect.arrayContaining([
                expect.objectContaining({ name: 'getCurrentWeather' }),
                expect.objectContaining({ name: 'getFutureWeatherForecast' }),
            ])
        }));
    })

    it('calls correct function with correct arguments based on openAI API response', async () => {
        vi.mocked(openAIClient.responses.create).mockResolvedValue({
            output: [
                {
                    name: 'getFutureWeatherForecast',
                    arguments: `{
                        "date": {
                            "year": 2024,
                            "month": 11,
                            "day": 30
                        }
                    }`
                }
            ]
        } as any);
        vi.mocked(getCoordinates).mockResolvedValue(mockCoordinates);

        await weatherFunctionController(mockConversation, mockedUserRequestDetails);

        expect(getWeatherForecast).toHaveBeenCalledWith(
            mockCoordinates,
            mockConversation,
            {
                year: 2024,
                month: 11,
                day: 30
            }
        );
        expect(getCurrentWeather).not.toHaveBeenCalled();
    })

    it('returns default response when no matching weather function found', async () => {
        vi.mocked(openAIClient.responses.create).mockResolvedValue({
            output: [{ name: '' }]
        } as any)

        const response = await weatherFunctionController(mockConversation, mockedUserRequestDetails);

        expect(getCurrentWeather).not.toHaveBeenCalled();
        expect(getWeatherForecast).not.toHaveBeenCalled();
        expect(response.outputText).toMatch(/sorry.*understand/i);
    })

    it('handles OpenAI API errors', async () => {
        vi.mocked(openAIClient.responses.create).mockRejectedValue(new Error('API Error'));

        const result = await weatherFunctionController(mockConversation, mockedUserRequestDetails);

        expect(result.outputText).toMatch(/sorry/i);
    });
})