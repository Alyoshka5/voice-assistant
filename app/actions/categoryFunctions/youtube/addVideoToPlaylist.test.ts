import { beforeEach, afterEach } from 'vitest';
import addVideoToPlaylist from './addVideoToPlaylist';
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

describe('addVideoToPlaylist', () => {
    const mockAddVideoToPlaylistDetails = { 
        youtubeLink: 'https://www.youtube.com/watch?v=video-id',
        playlistName: 'playlist name', 
    };
    
    beforeEach(() => {
        vi.clearAllMocks();
        
        vi.mocked(auth).mockResolvedValue({
            accessToken: 'abdef',
            user: { name: 'Test User' }
        } as any)
        
        global.fetch = vi.fn().mockImplementation((url, options) => {
            // GET /playlists
            if (url.includes('/playlists') && (!options?.method || options?.method === 'GET')) {
                return Promise.resolve(createFetchResponse({
                    items: [
                        { id: 'playlist-1', snippet: { title: 'playlist 1 title' } },
                        { id: 'playlist-2', snippet: { title: 'playlist 2 title' } },
                    ]
                }));
            }
            // POST /playlistItems
            if (url.includes('/playlistItems')) {
                return Promise.resolve(createFetchResponse({ snippet: { title: 'list title' } }));
            }
            // POST /playlists
            return Promise.resolve(createFetchResponse({}, false));
        })
    })
    
    afterEach(() => {
        vi.resetAllMocks();
    })

    it('returns error message when user not signed in', async () => {
        vi.mocked(auth).mockResolvedValue(null as any);

        const result = await addVideoToPlaylist(mockAddVideoToPlaylistDetails);

        expect(result.outputText).toMatch(/sign.*in/i);
    })

    it('adds video to an existing playlist', async () => {
        vi.mocked(openAIClient.responses.create).mockResolvedValue({
            output_text: 'list-1'
        } as any)

        const result = await addVideoToPlaylist(mockAddVideoToPlaylistDetails);

        expect(global.fetch).toHaveBeenCalledTimes(2);
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringMatching(encodeURIComponent('playlists')), 
            expect.any(Object)
        );
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringMatching(encodeURIComponent('playlistItems')), 
            expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('video-id')
            })
        );
        expect(openAIClient.responses.create).toHaveBeenCalledWith(
            expect.objectContaining({
                input: expect.stringMatching(/playlist-1.*playlist 1 title|playlist 1 title.*playlist-1/)
            })
        )
        expect(result.outputText).toMatch(/added/i);
    })

    it('create a new playlist if no match is found and adds video to the playlist', async () => {
        vi.mocked(openAIClient.responses.create).mockResolvedValue({
            output_text: ''
        } as any)
        global.fetch = vi.fn().mockImplementation((url, options) => {
            // GET /playlists
            if (url.includes('/playlists') && (!options?.method || options?.method === 'GET')) {
                return createFetchResponse({ items: [] });
            }
            // POST playlists
            if (url.includes('/playlists') && options?.method === 'POST') {
                return createFetchResponse({
                    id: 'playlist-new',
                });
            }
            // POST /playlistItems
            if (url.includes('/playlistItems')) {
                return createFetchResponse({ snippet: { title: 'video title' } });
            }
            return createFetchResponse({}, false);
        })

        const result = await addVideoToPlaylist(mockAddVideoToPlaylistDetails);

        expect(global.fetch).toHaveBeenCalledTimes(3);
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringMatching(encodeURIComponent('playlists')), 
            expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining(mockAddVideoToPlaylistDetails.playlistName)
            })
        );
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringMatching(encodeURIComponent('playlistItems')), 
            expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('video-id')
            })
        );
        expect(openAIClient.responses.create).toHaveBeenCalledWith(
            expect.objectContaining({
                input: expect.stringContaining(mockAddVideoToPlaylistDetails.playlistName)
            })
        )
        expect(result.outputText).toMatch(/added/i);
    })

    it('handles Google API errors', async () => {
        global.fetch = vi.fn().mockResolvedValue(createFetchResponse({}, false));

        const result = await addVideoToPlaylist(mockAddVideoToPlaylistDetails);

        expect(result.outputText).toMatch(/sorry/i);
    });

    it('handles OpenAI API errors', async () => {
        vi.mocked(openAIClient.responses.create).mockRejectedValue(new Error('API Error'));

        const result = await addVideoToPlaylist(mockAddVideoToPlaylistDetails);

        expect(result.outputText).toMatch(/sorry/i);
    });
})