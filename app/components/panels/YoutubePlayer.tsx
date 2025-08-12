import ReactPlayer from 'react-player';

export default function YoutubePlayer({ videoId }: { videoId: string }) {
    return (
        <ReactPlayer
            src={`https://www.youtube.com/watch?v=${videoId}`}
            style={{margin: '2rem 0'}}
            controls
        />
    );
}