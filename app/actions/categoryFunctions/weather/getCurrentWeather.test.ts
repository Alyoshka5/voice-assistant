import { beforeEach, afterEach } from 'vitest';
import getCurrentWeather from './getCurrentWeather';
import { auth } from '@/auth';
import { Conversation, Coordinates } from '@/app/types/types';
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

describe('getCurrentWeather', () => {
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

    beforeEach(() => {
        vi.stubEnv('GOOGLE_WEATHER_API_KEY', 'abcdefghijklmnopqrstuvwxyz012345');

        vi.clearAllMocks();
        
        vi.mocked(auth).mockResolvedValue({
            accessToken: 'abdef',
            user: { name: 'Test User' }
        } as any)

        global.fetch = vi.fn().mockResolvedValue(createFetchResponse({
            temperature: { degrees: 20 },
            feelsLikeTemperature: { degrees: 20.2 },
            dewPoint: { degrees: 20 },
            heatIndex: { degrees: 20 },
            windChill: { degrees: 20 },
            weatherCondition: {
                iconBaseUri: 'http://iconuri.com',
                description: { text: 'weather description' }
            },
            precipitation: {
                probability: { percent: 50 }
            },
            wind: {
                speed: { value: 5 }
            }
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

        const result = await getCurrentWeather(mockCoordinates, mockConversation);

        expect(result.outputText).toMatch(/sign.*in/i);
    })

    it('returns weather message and data', async () => {
        const result = await getCurrentWeather(mockCoordinates, mockConversation);

        expect(global.fetch).toHaveBeenCalled();
        expect(openAIClient.responses.create).toHaveBeenCalledWith(expect.objectContaining({
            input: expect.arrayContaining([
                expect.objectContaining({role: 'system'}),
                ...mockConversation
            ]),
        }))
        expect(result.outputText).toBe('assistant weather response');
        expect(result.action).toMatch(/current.*weather/i);
        expect(result.details?.temperature).toBe(20);
        expect(result.details?.windSpeed).toBe(5);
    })

    it('handles Google API errors', async () => {
        global.fetch = vi.fn().mockResolvedValue(createFetchResponse({}, false));

        const result = await getCurrentWeather(mockCoordinates, mockConversation);

        expect(result.outputText).toMatch(/sorry/i);
    });

    it('handles OpenAI API errors', async () => {
        vi.mocked(openAIClient.responses.create).mockRejectedValue(new Error('API Error'));

        const result = await getCurrentWeather(mockCoordinates, mockConversation);

        expect(result.outputText).toMatch(/sorry/i);
    });
})