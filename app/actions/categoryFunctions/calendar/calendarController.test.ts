import { afterEach } from 'vitest';
import calendarFunctionController from './calendarController';
import openAIClient from '@/app/lib/openai';
import { Conversation, UserRequestDetails } from '@/app/types/types';
import getEventsFromCalendar from "./getEventsFromCalendar";
import addEventToCalendar from "./addEventToCalendar";
import getEventInformation from "./getEventInformation";

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

vi.mock('./getEventsFromCalendar', () => ({ default: vi.fn() }));
vi.mock('./addEventToCalendar', () => ({ default: vi.fn() }));
vi.mock('./getEventInformation', () => ({ default: vi.fn() }));

describe('calendarFunctionController', () => {
    const mockConversation: Conversation = [
        {
            role: 'user',
            content: 'user message',
        },
    ]

    const mockedUserRequestDetails: UserRequestDetails = {
        coordinates: { latitude: 49.2827, longitude: -123.1207 },
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
                { name: 'calendar function name' }
            ]
        } as any)

        await calendarFunctionController(mockConversation, mockedUserRequestDetails);

        expect(openAIClient.responses.create).toHaveBeenCalledWith(expect.objectContaining({
            input: expect.arrayContaining([
                expect.objectContaining({role: 'system'}),
                ...mockConversation
            ]),
            tools: expect.arrayContaining([
                expect.objectContaining({ name: 'getEventsFromCalendar' }),
                expect.objectContaining({ name: 'addEventToCalendar' }),
                expect.objectContaining({ name: 'getEventInformation' }),
            ])
        }))
    })

    it('calls correct function with correct arguments based on openAI API response', async () => {
        vi.mocked(openAIClient.responses.create).mockResolvedValue({
            output: [
                {
                    name: 'getEventsFromCalendar',
                    arguments: `{
                        "calendarName": "calendar name"
                    }`
                }
            ]
        } as any)

        await calendarFunctionController(mockConversation, mockedUserRequestDetails);

        expect(getEventsFromCalendar).toHaveBeenCalledWith(
            'calendar name',
            mockedUserRequestDetails.date, 
            mockedUserRequestDetails.time
        );
        expect(addEventToCalendar).not.toHaveBeenCalled();
        expect(getEventInformation).not.toHaveBeenCalled();
    })

    it('returns default response when no matching task found', async () => {
        vi.mocked(openAIClient.responses.create).mockResolvedValue({
            output: [{ name: '' }]
        } as any)

        const response = await calendarFunctionController(mockConversation, mockedUserRequestDetails);

        expect(getEventsFromCalendar).not.toHaveBeenCalled();
        expect(addEventToCalendar).not.toHaveBeenCalled();
        expect(getEventInformation).not.toHaveBeenCalled();
        expect(response.outputText).toMatch(/sorry.*understand/i);
    })

    it('handles OpenAI API errors', async () => {
        vi.mocked(openAIClient.responses.create).mockRejectedValue(new Error('API Error'));

        const result = await calendarFunctionController(mockConversation, mockedUserRequestDetails);

        expect(result.outputText).toMatch(/sorry/i);
    });
})