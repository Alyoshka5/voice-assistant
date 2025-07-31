
export type AddVideoToPlaylistDetails = {
    youtubeLink: string;
    playlistName: string;
}

export type YoutubePlaylist = {
    id: string;
    snippet: {
        title: string;
    }
}

export type YoutubePlaylistsList = {
    items: YoutubePlaylist[];
}