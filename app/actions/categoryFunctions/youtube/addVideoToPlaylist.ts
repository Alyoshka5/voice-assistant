import { Conversation } from "@/app/types/types";
import openAIClient from "@/app/lib/openai";
import { auth } from "@/auth";
import { AddVideoToPlaylistDetails, YoutubePlaylist, YoutubePlaylistsList } from "@/app/types/types";


export default async function addVideoToPlaylist(conversation: Conversation, details: AddVideoToPlaylistDetails) {
    const session = await auth();
    if (!session)
        return {outputText: 'You need to be signed in to add a video to a playlist.'}

    const accessToken = session.accessToken;
    if (!accessToken)
        return {outputText: 'You need to be signed in to add a video to a playlist.'}


    const playlistResponse = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet,id&mine=true&maxResults=50', {
        headers: {
            Authorization: 'Bearer ' + accessToken,
        },
    });
    if (!playlistResponse.ok)
        return {outputText: `Sorry, I couldn't add the video to the playlist.`}

    const playlistData: YoutubePlaylistsList = await playlistResponse.json();

    const playlistNames = playlistData.items.map((playlist: YoutubePlaylist) => {
        return `Name: ${playlist.snippet.title}, ID: ${playlist.id}`;
    });
    
    const requestedPlaylistName = details.playlistName;
    if (!requestedPlaylistName)
        return {outputText: `Sorry I can't add the video because you didn't provide a playlist name.`}

    
    const youtubeLink = details.youtubeLink;
    if (!youtubeLink)
        return {outputText: `Sorry I can't add the video because I couldn't find a video link.`}
    
    const playlistIdentifierMessage = createPlaylistIdentifierMessage(playlistNames, requestedPlaylistName);
    let openaiResponse;
    try {
        openaiResponse = await openAIClient.responses.create({
            model: "gpt-4.1-nano",
            input: playlistIdentifierMessage
        });
        if (openaiResponse.error)
            throw new Error(openaiResponse.error.message);
    } catch (error) {
        return {outputText: `Sorry, I couldn't add the video to the playlist.`}
    }

    let playlistId = openaiResponse.output_text.trim();
    const openaiDefaultPlaylistIds = ['', '\'\'', '""', '```plaintext\n```']
    if (openaiDefaultPlaylistIds.includes(playlistId)) { // playlist doesn't exist
        playlistId = await createPlaylist(requestedPlaylistName, accessToken);
        if (playlistId === '')
            return {outputText: `Sorry, I couldn't find or create a playlist with the name ${requestedPlaylistName}.`}
    }

    const youtubeVideoId = youtubeLink.split('v=')[1].split('&')[0]
    const videoTitle = await addVideo(accessToken, playlistId, youtubeVideoId);
    if (videoTitle === '')
        return {outputText: `Sorry, I couldn't add the video to the playlist.`}

    return {outputText: `I added ${videoTitle} to your ${details.playlistName} playlist`}
}

function createPlaylistIdentifierMessage(playlistNames: string[], requestedPlaylistName: string) {
    return `Given a list of YouTube playlist names and ids, respond with the playlist id of the most relevant playlist name based on the user's request.
    If no relevant playlist is found, return an empty string. Do not return anything except for the playlist id or an empty string.
    Playlist Names and IDs: ${playlistNames.join('\n')}
    Requested playlist name: ${requestedPlaylistName}`;
}

async function createPlaylist(requestedPlaylistName: string, accessToken: string) {
    const res = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet', {
        method: 'POST', 
        headers: {
            Authorization: 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            snippet: {
                title: requestedPlaylistName
            }
        })
    });
    
    if (!res.ok)
        return '';
    
    const data = await res.json();
    return data.id;
}

async function addVideo(accessToken: string, playlistId: string, videoId: string) {
    const res = await fetch('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet', {
        method: 'POST', 
        headers: {
            Authorization: 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            snippet: {
                playlistId: playlistId,
                resourceId: {
                    kind: 'youtube#video',
                    videoId: videoId,
                },
            }
        })
    });

    if (!res.ok)
        return '';

    const data = await res.json()

    return data.snippet.title;
}