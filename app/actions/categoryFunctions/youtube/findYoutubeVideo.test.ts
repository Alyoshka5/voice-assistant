import { beforeEach, afterEach } from 'vitest';
import getYouTubeVideoId from './findYoutubeVideo';
import { auth } from '@/auth';

vi.mock('@/auth', () => ({
    auth: vi.fn()
}));

function createFetchResponse(data: any, ok: boolean = true) {
    return {
        ok,
        json: () => Promise.resolve(data)
    }
}

describe('getYouTubeVideoId', () => {
    const mockQuery = 'user video query';

    beforeEach(() => {
        vi.clearAllMocks();
        
        vi.mocked(auth).mockResolvedValue({
            accessToken: 'abdef',
            user: { name: 'Test User' }
        } as any)
    })
    
    afterEach(() => {
        vi.resetAllMocks();
    })

    it('returns error message when user not signed in', async () => {
        vi.mocked(auth).mockResolvedValue(null as any);

        const result = await getYouTubeVideoId(mockQuery);

        expect(result.outputText).toMatch(/sign.*in/i);
    })

    it('returns output text and necessary data', async () => {
        global.fetch = vi.fn().mockResolvedValue(Promise.resolve(createFetchResponse({
            items: [
                {
                    id: { videoId: 'video-id' },
                    snippet: {
                        title: 'video title',
                        channelTitle: 'channel title'
                    }
                }
            ]
        })))
        
        const result = await getYouTubeVideoId(mockQuery);

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringMatching(encodeURIComponent(mockQuery)),
            expect.any(Object)
        );
        expect(result.outputText).toMatch(/here is/i);
        expect(result.databaseText).toMatch(/here is.*https:\/\/www.youtube.com\/watch\?v=video-id/i);
        expect(result.action).toBe('displayYoutubeVideo');
        expect(result.details).toEqual(expect.objectContaining({
            videoId: 'video-id'
        }))
    })

    it('handles Google API errors', async () => {
        global.fetch = vi.fn().mockResolvedValue(createFetchResponse({}, false));

        const result = await getYouTubeVideoId(mockQuery);

        expect(result.outputText).toMatch(/sorry/i);
    });
})