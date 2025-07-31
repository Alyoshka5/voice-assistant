import { auth } from '@/auth';

export default async function getYouTubeVideoId(query: string) {
    const session = await auth();
    if (!session) {
        return {
            outputText: 'You need to be signed in to find a video.',
            action: '',
            details: {}
        }
    } 
    const accessToken = session.accessToken;
    if (!accessToken) {
        return {
            outputText: 'You need to be signed in to find a video.',
            action: '',
            details: {}
        }
    }
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&videoEmbeddable=true`, {
        headers: {
            Authorization: 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
        }
    });

    if (!res.ok) {
        return {
            outputText: `Sorry, I couldn't find a video.`,
            action: '',
            details: {}
        }
    }

    const data = await res.json();
    const videoData = data.items?.[0];
    const videoId = videoData.id.videoId;

    return {
        outputText: `Here is "${videoData.snippet.title}" by ${videoData.snippet.channelTitle}. - https://www.youtube.com/watch?v=${videoId}`,
        action: 'displayYoutubeVideo',
        details: videoId
    }
}
