import { handlers } from './handlers';
import { http, HttpResponse } from 'msw';

export const e2eHandlers = [
    ...handlers,
    http.get(/https:\/\/weather.googleapis.com\/v1\/currentConditions:lookup/, async () => {
        return HttpResponse.json({
            temperature: { degrees: 20 },
            feelsLikeTemperature: { degrees: 20.2 },
            dewPoint: { degrees: 20 },
            heatIndex: { degrees: 20 },
            windChill: { degrees: 20 },
            weatherCondition: {
                iconBaseUri: 'https://maps.gstatic.com/weather/v1/cloudy',
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
    http.get('https://tasks.googleapis.com/tasks/v1/users/@me/lists', async () => {
        return HttpResponse.json({
            items: [
                { title: 'work', id: 'work-list-id' },
                { title: 'chores', id: 'chores-list-id' },
            ]
        });
    }),
]