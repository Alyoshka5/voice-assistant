import { Conversation, UserRequestDetails } from "@/app/types/types";
import getDefaultResponse from "./getDefaultResponse";
import openAIClient from "@/app/lib/openai";

vi.mock('@/app/lib/openai', () => ({
    default: {
        responses: {
            create: vi.fn()
        }
    }
}));

describe('getDefaultResponse', () => {
    it('calls openaiAPI with correct input and returns correct response structure', async () => {
        vi.mocked(openAIClient.responses.create).mockResolvedValue({
            output_text: 'assistant response'
        } as any)

        const mockedConversation: Conversation = [
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

        const result = await getDefaultResponse(mockedConversation, mockedUserRequestDetails);

        expect(openAIClient.responses.create).toHaveBeenCalledWith(expect.objectContaining({
            input: expect.arrayContaining([
                expect.objectContaining({role: 'system', content: expect.stringMatching(/2:30 PM.*Wednesday, December 19, 2025|Wednesday, December 19, 2025*2:30 PM/s)}),
                ...mockedConversation
            ])
        }))
        expect(result.outputText).toBe('assistant response');
    })
})