import { beforeEach, afterEach } from 'vitest';
import getEventInformation from './getEventInformation';
import { auth } from '@/auth';
import openAIClient from '@/app/lib/openai';
import { Conversation } from '@/app/types/types';

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

describe('getEventInformation', () => {
    const mockRequestedCalendarName = 'calendar-1 title';
    const mockRequestedEventName = 'event-1 title';
    const mockCurrentDate = 'Saturday, November 30, 2024';
    const mockCurrentTime = '3:00 PM'
    const mockConversation: Conversation = [
        {
            role: 'user',
            content: 'user message',
        },
    ]

    beforeEach(() => {
        vi.clearAllMocks();
        
        vi.mocked(auth).mockResolvedValue({
            accessToken: 'abdef',
            user: { name: 'Test User' }
        } as any)
        
        global.fetch = vi.fn().mockImplementation((url, options) => {
            // GET /users/me/calendarList
            if (url.includes('/users/me/calendarList') && (!options?.method || options?.method === 'GET')) {
                return Promise.resolve(createFetchResponse({
                    items: [
                        { id: 'calendar-1', summary: 'calendar 1 title', accessRole: 'owner' },
                        { id: 'calendar-2', summary: 'calendar 2 title', accessRole: 'owner' }
                    ]
                }));
            }
            // POST /events
            if (url.includes('/events')) {
                return Promise.resolve(createFetchResponse({
                    items: [
                        {
                            id: 'event-1',
                            summary: 'event 1 title',
                            start: {
                                dateTime: '2024-11-30T15:00:00.884Z'
                            },
                            end: {
                                dateTime: '2024-11-30T16:00:00.884Z'
                            },
                        },
                        {
                            id: 'event-2',
                            summary: 'event 2 title',
                            start: {
                                dateTime: '2030-05-04T17:00:00.884Z'
                            },
                            end: {
                                dateTime: '2030-05-04T22:00:00.884Z'
                            },
                        },
                    ]
                }));
            }
        })
    })
    
    afterEach(() => {
        vi.resetAllMocks();
    })
    
    it('returns error message when user not signed in', async () => {
        vi.mocked(auth).mockResolvedValue(null as any);

        const result = await getEventInformation(
            mockConversation, 
            mockRequestedCalendarName, 
            mockRequestedEventName, 
            mockCurrentDate, 
            mockCurrentTime
        );

        expect(result.outputText).toMatch(/sign.*in/i);
    })

    it('asks for calendar name when missing', async () => {
        const result = await getEventInformation(
            mockConversation, 
            '', 
            mockRequestedEventName, 
            mockCurrentDate, 
            mockCurrentTime
        );

        expect(result.outputText).toMatch(/calendar.*\?/i);
    })

    it('asks for event name when missing', async () => {
        const result = await getEventInformation(
            mockConversation, 
            mockRequestedCalendarName, 
            '', 
            mockCurrentDate, 
            mockCurrentTime
        );

        expect(result.outputText).toMatch(/event.*\?/i);
    })

    it('gets event information from requested calendar', async () => {
        vi.mocked(openAIClient.responses.create).mockResolvedValueOnce({
            output_text: 'calendar-1'
        } as any);
        vi.mocked(openAIClient.responses.create).mockResolvedValueOnce({
            output_text: 'event-1'
        } as any);
        vi.mocked(openAIClient.responses.create).mockResolvedValueOnce({
            output_text: 'assistant information response message'
        } as any);

        await getEventInformation(
            mockConversation, 
            mockRequestedCalendarName, 
            mockRequestedEventName, 
            mockCurrentDate, 
            mockCurrentTime
        );

        expect(global.fetch).toHaveBeenCalledTimes(2);
        expect(openAIClient.responses.create).toHaveBeenCalledWith(
            expect.objectContaining({
                input: expect.stringMatching(/calendar-1.*calendar 1 title|calendar 1 title.*calendar-1/)
            })
        );
        expect(openAIClient.responses.create).toHaveBeenCalledWith(
            expect.objectContaining({
                input: expect.stringMatching(/event-1.*event 1 title|event 1 title.*event-1/)
            })
        );
        expect(openAIClient.responses.create).toHaveBeenCalledWith(expect.objectContaining({
                input: expect.arrayContaining([
                    expect.objectContaining({role: 'system'}),
                    ...mockConversation
                ])
            })
        );
    })

    it('handles calendar not existing', async () => {
        vi.mocked(openAIClient.responses.create).mockResolvedValueOnce({
            output_text: ''
        } as any);
        vi.mocked(openAIClient.responses.create).mockResolvedValueOnce({
            output_text: 'event-1'
        } as any);
        vi.mocked(openAIClient.responses.create).mockResolvedValueOnce({
            output_text: 'assistant information response message'
        } as any);

        const result = await getEventInformation(
            mockConversation, 
            mockRequestedCalendarName, 
            mockRequestedEventName, 
            mockCurrentDate, 
            mockCurrentTime
        );

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(openAIClient.responses.create).toHaveBeenCalledWith(
            expect.objectContaining({
                input: expect.stringMatching(/calendar-1.*calendar 1 title|calendar 1 title.*calendar-1/)
            })
        );
        expect(openAIClient.responses.create).toHaveBeenCalledTimes(1);
        expect(result.outputText).toMatch(/sorry/i);
    })

    it('handles event not existing', async () => {
        vi.mocked(openAIClient.responses.create).mockResolvedValueOnce({
            output_text: 'calendar-1'
        } as any);
        vi.mocked(openAIClient.responses.create).mockResolvedValueOnce({
            output_text: ''
        } as any);
        vi.mocked(openAIClient.responses.create).mockResolvedValueOnce({
            output_text: 'assistant information response message'
        } as any);

        const result = await getEventInformation(
            mockConversation, 
            mockRequestedCalendarName, 
            mockRequestedEventName, 
            mockCurrentDate, 
            mockCurrentTime
        );

        expect(global.fetch).toHaveBeenCalledTimes(2);
        expect(openAIClient.responses.create).toHaveBeenCalledWith(
            expect.objectContaining({
                input: expect.stringMatching(/calendar-1.*calendar 1 title|calendar 1 title.*calendar-1/)
            })
        );
        expect(openAIClient.responses.create).toHaveBeenCalledWith(
            expect.objectContaining({
                input: expect.stringMatching(/event-1.*event 1 title|event 1 title.*event-1/)
            })
        );
        expect(openAIClient.responses.create).toHaveBeenCalledTimes(2);
        expect(result.outputText).toMatch(/sorry/i);
    })

    it('handles Google API errors', async () => {
        global.fetch = vi.fn().mockResolvedValue(createFetchResponse({}, false));

        const result = await getEventInformation(
            mockConversation, 
            mockRequestedCalendarName, 
            mockRequestedEventName, 
            mockCurrentDate, 
            mockCurrentTime
        );

        expect(result.outputText).toMatch(/sorry/i);
    });

    it('handles OpenAI API errors', async () => {
        vi.mocked(openAIClient.responses.create).mockRejectedValue(new Error('API Error'));

        const result = await getEventInformation(
            mockConversation, 
            mockRequestedCalendarName, 
            mockRequestedEventName, 
            mockCurrentDate, 
            mockCurrentTime
        );

        expect(result.outputText).toMatch(/sorry/i);
    });
})