import { beforeEach, afterEach } from 'vitest';
import getWeatherForecast from './getFutureWeatherForecast';
import { auth } from '@/auth';
import { Conversation, Coordinates, DateObject } from '@/app/types/types';
import openAIClient from '@/app/lib/openai';

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

function createFetchResponse(data: any, ok: boolean = true) {
    return {
        ok,
        json: () => Promise.resolve(data)
    }
}

describe('getWeatherForecast', () => {
    const mockCoordinates: Coordinates = {
        latitude: 23.283412,
        longitude: -38.102932
    }

    const mockConversation: Conversation = [
        {
            role: 'user',
            content: 'user message',
        },
    ]

    const mockDateObject: DateObject = {
        year: 2024,
        month: 11,
        day: 30
    }

    beforeEach(() => {
        vi.stubEnv('GOOGLE_WEATHER_API_KEY', 'abcdefghijklmnopqrstuvwxyz012345');

        vi.clearAllMocks();
        
        vi.mocked(auth).mockResolvedValue({
            accessToken: 'abdef',
            user: { name: 'Test User' }
        } as any)

        global.fetch = vi.fn().mockResolvedValue(createFetchResponse({
            forecastDays: [{
                displayDate: {
                    year: 2024,
                    month: 11,
                    day: 30
                },
                daytimeForecast: {
                    weatherCondition: {
                        description: { text: 'weather condition description' },
                        type: 'condition type'
                    }
                },
                maxTemperature: { degrees: 20 },
                minTemperature: { degrees: 10 }
            }]
        }));

        vi.mocked(openAIClient.responses.create).mockResolvedValue({
            output_text: 'assistant weather response'
        } as any);
    })
    
    afterEach(() => {
        vi.resetAllMocks();
    })

    it('returns error message when user not signed in', async () => {
        vi.mocked(auth).mockResolvedValue(null as any);

        const result = await getWeatherForecast(mockCoordinates, mockConversation, mockDateObject);

        expect(result.outputText).toMatch(/sign.*in/i);
    })

    it('returns weather message and data', async () => {
        const result = await getWeatherForecast(mockCoordinates, mockConversation, mockDateObject);

        expect(global.fetch).toHaveBeenCalled();
        expect(openAIClient.responses.create).toHaveBeenCalledWith(expect.objectContaining({
            input: expect.arrayContaining([
                expect.objectContaining({role: 'system'}),
                ...mockConversation
            ]),
        }))
        expect(result.outputText).toBe('assistant weather response');
        expect(result.action).toMatch(/forecast.*weather|weather.*forecast/i);
        expect(result.details?.displayDate).toMatch(/^(?=.*2024)(?=.*11)(?=.*30).*$/);
        expect(result.details?.maxTemperature).toBe(20);
        expect(result.details?.minTemperature).toBe(10);
    })

    it('handles Google API errors', async () => {
        global.fetch = vi.fn().mockResolvedValue(createFetchResponse({}, false));

        const result = await getWeatherForecast(mockCoordinates, mockConversation, mockDateObject);

        expect(result.outputText).toMatch(/sorry/i);
    });

    it('handles OpenAI API errors', async () => {
        vi.mocked(openAIClient.responses.create).mockRejectedValue(new Error('API Error'));

        const result = await getWeatherForecast(mockCoordinates, mockConversation, mockDateObject);

        expect(result.outputText).toMatch(/sorry/i);
    });
})