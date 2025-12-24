import { afterEach } from 'vitest';
import youtubeFunctionController from './youtubeController';
import openAIClient from '@/app/lib/openai';
import { Conversation, Coordinates, UserRequestDetails } from '@/app/types/types';
import addVideoToPlaylist from "./addVideoToPlaylist";
import findYoutubeVideo from "./findYoutubeVideo";

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

vi.mock('./addVideoToPlaylist', () => ({ default: vi.fn() }));
vi.mock('./findYoutubeVideo', () => ({ default: vi.fn() }));

describe('youtubeFunctionController', () => {
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
                { name: 'youtube function name' }
            ]
        } as any);

        await youtubeFunctionController(mockConversation, mockedUserRequestDetails);

        expect(openAIClient.responses.create).toHaveBeenCalledWith(expect.objectContaining({
            input: expect.arrayContaining([
                expect.objectContaining({role: 'system'}),
                ...mockConversation
            ]),
            tools: expect.arrayContaining([
                expect.objectContaining({ name: 'addVideoToPlaylist' }),
                expect.objectContaining({ name: 'findYoutubeVideo' }),
            ])
        }));
    })

    it('calls correct function with correct arguments based on openAI API response', async () => {
        vi.mocked(openAIClient.responses.create).mockResolvedValue({
            output: [
                {
                    name: 'addVideoToPlaylist',
                    arguments: `{
                        "youtubeLink": "https://www.youtube.com/watch?v=video-id",
                        "playlistName": "playlist name"
                    }`
                }
            ]
        } as any);

        await youtubeFunctionController(mockConversation, mockedUserRequestDetails);

        expect(addVideoToPlaylist).toHaveBeenCalledWith({ 
            youtubeLink: 'https://www.youtube.com/watch?v=video-id',
            playlistName: 'playlist name', 
        });
        expect(findYoutubeVideo).not.toHaveBeenCalled();
    })

    it('returns default response when no matching youtube function found', async () => {
        vi.mocked(openAIClient.responses.create).mockResolvedValue({
            output: [{ name: '' }]
        } as any)

        const response = await youtubeFunctionController(mockConversation, mockedUserRequestDetails);

        expect(addVideoToPlaylist).not.toHaveBeenCalled();
        expect(findYoutubeVideo).not.toHaveBeenCalled();
        expect(response.outputText).toMatch(/sorry.*understand/i);
    })

    it('handles OpenAI API errors', async () => {
        vi.mocked(openAIClient.responses.create).mockRejectedValue(new Error('API Error'));

        const result = await youtubeFunctionController(mockConversation, mockedUserRequestDetails);

        expect(result.outputText).toMatch(/sorry/i);
    });
})