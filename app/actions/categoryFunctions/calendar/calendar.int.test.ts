import prisma from '@/app/lib/db';
import getOpenAIResponse from '@/app/actions/getOpenAIResponse';
import { UserRequestDetails } from '@/app/types/types';
import { beforeAll, afterEach } from 'vitest';
import { resetDatabaseWithUser } from '@/app/tests/test-utils';
import { http, HttpResponse } from 'msw';
import { server } from '@/app/tests/mocks/server';

describe('Calendar Controller Integration', () => {

    beforeAll(async () => {
        await resetDatabaseWithUser();

    });
    
    beforeEach(async () => {
        server.use(
            http.get('https://www.googleapis.com/calendar/v3/users/me/calendarList', async () => {
                return HttpResponse.json({
                    items: [
                        { id: 'primary-calendar-id@group.calendar.google.com', summary: 'primary', accessRole: 'owner' },
                        { id: 'school-calendar-id@group.calendar.google.com', summary: 'school', accessRole: 'owner' }
                    ]
                });
            }),
            http.get(/https:\/\/www.googleapis.com\/calendar\/v3\/calendars\/primary-calendar-id@group.calendar.google.com\/events.*/, async () => {
                return HttpResponse.json({
                    items: [
                        {
                            id: 'dinner-event-id',
                            status: 'confirmed',
                            summary: 'dinner',
                            description: 'dinner event description',
                            location: '',
                            creator: '',
                            start: {
                                dateTime: '2024-11-30T15:00:00.884Z'
                            },
                            end: {
                                dateTime: '2024-11-30T16:00:00.884Z'
                            },
                        },
                        {
                            id: 'exercise-event-id',
                            status: 'confirmed',
                            summary: 'exercise',
                            description: '',
                            location: '',
                            creator: '',
                            start: {
                                dateTime: '2030-05-04T17:00:00.884Z'
                            },
                            end: {
                                dateTime: '2030-05-04T22:00:00.884Z'
                            },
                        },
                    ]
                });
            }),
            http.post('https://www.googleapis.com/calendar/v3/calendars/primary-calendar-id@group.calendar.google.com/events', async () => {
                return HttpResponse.json({ summary: 'lunch' });
            })
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
    
    it('runs getEventsFromCalendar function and returns a response', async () => {
        const userMessage = 'What events do I have in my primary calendar?';
        const assistantMessage = /event(?=.*primary)(?=.*dinner)(?=.*exercise)/i;

        const response = await getOpenAIResponse(userMessage, mockUserRequestDetails);

        expect(response.outputText).toMatch(assistantMessage);
        expect(response.action).toBeFalsy();

        const messages = await prisma.message.findMany({
            orderBy: { createdAt: 'asc' }
        });

        expect(messages).toHaveLength(2);
        expect(messages[0].role).toBe('user');
        expect(messages[0].content).toBe(userMessage);
        expect(messages[1].role).toBe('assistant');
        expect(messages[1].content).toMatch(assistantMessage);
    })
    
    it('runs addEventToCalendar function and returns a response', async () => {
        const userMessage = 'Add a lunch event to my primary calendar for tomorrow at 1pm that lasts one hour';
        const assistantMessage = /added(?=.*primary)(?=.*lunch)/i;

        const response = await getOpenAIResponse(userMessage, mockUserRequestDetails);

        expect(response.outputText).toMatch(assistantMessage);
        expect(response.action).toBeFalsy();

        const messages = await prisma.message.findMany({
            orderBy: { createdAt: 'asc' }
        });

        expect(messages).toHaveLength(2);
        expect(messages[0].role).toBe('user');
        expect(messages[0].content).toBe(userMessage);
        expect(messages[1].role).toBe('assistant');
        expect(messages[1].content).toMatch(assistantMessage);
    })
    
    it('runs getEventInformation function and returns a response', async () => {
        const userMessage = 'What time is my primary calendar\'s dinner event at';
        const assistantMessage = 'Your dinner event is at 3:00 pm';

        const response = await getOpenAIResponse(userMessage, mockUserRequestDetails);

        expect(response.outputText).toMatch(assistantMessage);
        expect(response.action).toBeFalsy();

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