import styles from  './Youtube.module.css'
import ReactPlayer from 'react-player';

export default function YoutubePlayer({ videoId }: { videoId: string }) {
    return (
        <div className={styles.player_container}>
            <div className={styles.player_wrapper}>
                <ReactPlayer
                    src={`https://www.youtube.com/watch?v=${videoId}`}
                    width="100%"
                    height="100%"
                    controls
                />
            </div>
        </div>
    );
}