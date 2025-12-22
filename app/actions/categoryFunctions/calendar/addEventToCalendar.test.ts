import { beforeEach, afterEach } from 'vitest';
import addEventToCalendar from './addEventToCalendar';
import { auth } from '@/auth';
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

describe('addEventToCalendar', () => {
    const mockEventDetails = { 
        eventName: 'event name', 
        calendarName: 'calendar-1 title',
        relativeDate: 'tomorrow',
        relativeTime: 'at 3 PM',
        duration: '2 hours'
    };
    const mockIsoNow = '2024-11-30T15:00:00.884Z';
    const mockTimeZone = 'America/Vancouver';

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
                return Promise.resolve(createFetchResponse({ summary: 'event title' }));
            }
        })
    })
    
    afterEach(() => {
        vi.resetAllMocks();
    })

    it('asks for event name when missing', async () => {
        const mockEventDetailsNoEventName = { ...mockEventDetails }
        mockEventDetailsNoEventName.eventName = '';

        const result = await addEventToCalendar(mockEventDetailsNoEventName, mockIsoNow, mockTimeZone);

        expect(result.outputText).toMatch(/event.*\?/i);
    })

    it('asks for calendar name when missing', async () => {
        const mockEventDetailsNoCalendarName = { ...mockEventDetails }
        mockEventDetailsNoCalendarName.calendarName = '';

        const result = await addEventToCalendar(mockEventDetailsNoCalendarName, mockIsoNow, mockTimeZone);

        expect(result.outputText).toMatch(/calendar.*\?/i);
    })

    it('asks for event date/time when missing', async () => {
        const mockEventDetailsNoName = { ...mockEventDetails }
        mockEventDetailsNoName.relativeDate = '';
        mockEventDetailsNoName.relativeTime = '';

        const result = await addEventToCalendar(mockEventDetailsNoName, mockIsoNow, mockTimeZone);

        expect(result.outputText).toMatch(/when.*\?/i);
    })

    it('returns error message when user not signed in', async () => {
        vi.mocked(auth).mockResolvedValue(null as any);

        const result = await addEventToCalendar(mockEventDetails, mockIsoNow, mockTimeZone);

        expect(result.outputText).toMatch(/sign.*in/i);
    })

    it('adds event to an existing calendar', async () => {
        vi.mocked(openAIClient.responses.create).mockResolvedValue({
            output_text: 'calendar-1'
        } as any)

        const result = await addEventToCalendar(mockEventDetails, mockIsoNow, mockTimeZone);

        expect(global.fetch).toHaveBeenCalledWith(expect.any(String),
            expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('event name')
            })
        )
        expect(global.fetch).toHaveBeenCalledTimes(2);
        expect(openAIClient.responses.create).toHaveBeenCalledWith(
            expect.objectContaining({
                input: expect.stringMatching(/calendar-1.*calendar 1 title|calendar 1 title.*calendar-1/)
            })
        )
        expect(result.outputText).toMatch(/added/i);
    })

    it('handles calendar not existing', async () => {
        vi.mocked(openAIClient.responses.create).mockResolvedValue({
            output_text: ''
        } as any)

        const result = await addEventToCalendar(mockEventDetails, mockIsoNow, mockTimeZone);

        expect(openAIClient.responses.create).toHaveBeenCalledWith(
            expect.objectContaining({
                input: expect.stringMatching(/calendar-1.*calendar 1 title|calendar 1 title.*calendar-1/)
            })
        )
        expect(result.outputText).toMatch(/sorry/i);
    })

    it('handles Google API errors', async () => {
        global.fetch = vi.fn().mockResolvedValue(createFetchResponse({}, false));

        const result = await addEventToCalendar(mockEventDetails, mockIsoNow, mockTimeZone);

        expect(result.outputText).toMatch(/sorry/i);
    });

    it('handles OpenAI API errors', async () => {
        vi.mocked(openAIClient.responses.create).mockRejectedValue(new Error('API Error'));

        const result = await addEventToCalendar(mockEventDetails, mockIsoNow, mockTimeZone);

        expect(result.outputText).toMatch(/sorry/i);
    });
})