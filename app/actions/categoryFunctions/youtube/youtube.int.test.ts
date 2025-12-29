import prisma from '@/app/lib/db';
import getOpenAIResponse from '@/app/actions/getOpenAIResponse';
import { UserRequestDetails } from '@/app/types/types';
import { beforeAll, afterEach } from 'vitest';
import { resetDatabaseWithUser } from '@/app/tests/test-utils';
import { http, HttpResponse } from 'msw';
import { server } from '@/app/tests/mocks/server';
import { Role } from "@prisma/client";

describe('Youtube Controller Integration', () => {

    beforeAll(async () => {
        await resetDatabaseWithUser();

    });
    
    beforeEach(async () => {
        server.use(
            http.get(/https:\/\/www.googleapis.com\/youtube\/v3\/playlists/, async () => {
                return HttpResponse.json({
                    items: [
                        { id: 'finance-playlist-id', snippet: { title: 'finance' } },
                        { id: 'cooking-playlist-id', snippet: { title: 'cooking' } },
                    ]
                });
            }),
            http.post(/https:\/\/www.googleapis.com\/youtube\/v3\/playlists/, async () => { // should never get called
                return HttpResponse.json({
                    id: 'cooking-playlist-id'
                });
            }),
            http.post(/https:\/\/www.googleapis.com\/youtube\/v3\/playlistItems/, async () => {
                return HttpResponse.json({
                    snippet: { title: 'How to fry eggs' }
                });
            }),
            http.get(/https:\/\/www.googleapis.com\/youtube\/v3\/search/, async () => {
                return HttpResponse.json({
                    items: [
                        {
                            id: { videoId: 'video-id' },
                            snippet: {
                                title: 'How to fry eggs',
                                channelTitle: 'HowToCook'
                            }
                        },
                    ]
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
    
    it('runs addVideoToPlaylist function and returns a response', async () => {
        const userMessage = 'Add the video to my cooking playlist';
        const assistantMessage = /added(?=.*how to fry eggs)(?=.*cooking)/i;

        await prisma.message.create({
            data: {
                role: Role.assistant,
                content: 'Here is "How to fry eggs" by HowToCook: https://www.youtube.com/watch?v=video-id',
                user: {
                    connect: {
                        email: 'test@example.com'
                    }
                }
            }
        });

        const response = await getOpenAIResponse(userMessage, mockUserRequestDetails);

        expect(response.outputText).toMatch(assistantMessage);
        expect(response.action).toBeFalsy();

        const messages = await prisma.message.findMany({
            orderBy: { createdAt: 'asc' }
        });

        expect(messages).toHaveLength(3);
        expect(messages[1].role).toBe('user');
        expect(messages[1].content).toBe(userMessage);
        expect(messages[2].role).toBe('assistant');
        expect(messages[2].content).toMatch(assistantMessage);
    })
    
    it('runs findYoutubeVideo function and returns a response and video ID', async () => {
        const userMessage = 'Find a video on how to fry eggs';
        const assistantMessage = /(?=.*how to fry eggs)(?=.*howtocook)/i;
        const databaseMessage = /(?=.*how to fry eggs)(?=.*howtocook).*: https:\/\/www.youtube.com\/watch\?v=video-id/i;

        const response = await getOpenAIResponse(userMessage, mockUserRequestDetails);

        expect(response.outputText).toMatch(assistantMessage);
        expect(response.action).toMatch(/display.*video/i);
        expect(response.details).toMatchObject({ videoId: 'video-id' });

        const messages = await prisma.message.findMany({
            orderBy: { createdAt: 'asc' }
        });

        expect(messages).toHaveLength(2);
        expect(messages[0].role).toBe('user');
        expect(messages[0].content).toBe(userMessage);
        expect(messages[1].role).toBe('assistant');
        expect(messages[1].content).toMatch(databaseMessage);
    })
})