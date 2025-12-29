import prisma from '@/app/lib/db';
import getOpenAIResponse from '@/app/actions/getOpenAIResponse';
import { UserRequestDetails } from '@/app/types/types';
import { beforeAll, afterEach } from 'vitest';
import { resetDatabaseWithUser } from '@/app/tests/test-utils';
import { http, HttpResponse } from 'msw';
import { server } from '@/app/tests/mocks/server';

describe('Weather Controller Integration', () => {

    beforeAll(async () => {
        await resetDatabaseWithUser();

    });
    
    beforeEach(async () => {
        server.use(
            http.get(/https:\/\/weather.googleapis.com\/v1\/currentConditions:lookup/, async () => {
                return HttpResponse.json({
                    temperature: { degrees: 20 },
                    feelsLikeTemperature: { degrees: 20.2 },
                    dewPoint: { degrees: 20 },
                    heatIndex: { degrees: 20 },
                    windChill: { degrees: 20 },
                    weatherCondition: {
                        iconBaseUri: 'http://iconuri.com',
                        description: { text: 'cloudy' }
                    },
                    precipitation: {
                        probability: { percent: 50 }
                    },
                    wind: {
                        speed: { value: 5 }
                    }
                });
            }),
            http.get(/https:\/\/weather.googleapis.com\/v1\/forecast\/days:lookup/, async () => {
                return HttpResponse.json({
                    forecastDays: [{
                        displayDate: {
                            day: 20,
                            month: 12,
                            year: 2025
                        },
                        daytimeForecast: {
                            weatherCondition: {
                                description: { text: 'cloudy' },
                                type: 'CLOUDY'
                            }
                        },
                        maxTemperature: { degrees: 25 },
                        minTemperature: { degrees: 10 }
                    }]
                });
            }),
        );
    })

    afterEach(async () => {
        await prisma.message.deleteMany();
    })

    const mockUserRequestDetails: UserRequestDetails = {
        coordinates: { latitude: 23.283412, longitude: -38.102932 },
        date: "Wednesday, December 19, 2025",
        time: "2:30 PM",
        isoNow: "2025-12-19T14:30:00.000Z",
        timeZone: "America/Vancouver",
    }
    
    it('runs getCurrentWeather function and returns a response and weather data', async () => {
        const userMessage = 'What\'s the weather?';
        const assistantMessage = 'It is currently cloudy with a temperature of 20 degrees';

        const response = await getOpenAIResponse(userMessage, mockUserRequestDetails);

        expect(response.outputText).toMatch(assistantMessage);
        expect(response.action).toMatch(/current.*weather/i);
        expect(response.details).toMatchObject({
            temperature: 20,
            windSpeed: 5
        })

        const messages = await prisma.message.findMany({
            orderBy: { createdAt: 'asc' }
        });

        expect(messages).toHaveLength(2);
        expect(messages[0].role).toBe('user');
        expect(messages[0].content).toBe(userMessage);
        expect(messages[1].role).toBe('assistant');
        expect(messages[1].content).toMatch(assistantMessage);
    })
    
    it('runs getWeatherForecast function and returns a response and weather data', async () => {
        const userMessage = 'What\'s the weather tomorrow?';
        const assistantMessage = 'Tomorrow it is sunny with a high of 25 degrees';

        const response = await getOpenAIResponse(userMessage, mockUserRequestDetails);

        expect(response.outputText).toMatch(assistantMessage);
        expect(response.action).toMatch(/(?=.*weather)(?=.*forecast)/i);
        expect(response.details).toMatchObject({
            maxTemperature: 25,
            minTemperature: 10
        })

        const messages = await prisma.message.findMany({
            orderBy: { createdAt: 'asc' }
        });

        expect(messages).toHaveLength(2);
        expect(messages[0].role).toBe('user');
        expect(messages[0].content).toBe(userMessage);
        expect(messages[1].role).toBe('assistant');
        expect(messages[1].content).toMatch(assistantMessage);
    })
})