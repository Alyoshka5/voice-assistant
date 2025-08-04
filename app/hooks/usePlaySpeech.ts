'use client'

import convertToSpeech from "@/app/actions/convertTextToSpeech";
import { useCallback, useRef } from "react";

export default function usePlaySpeech() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const urlRef = useRef<string | null>(null);

    const playSpeech = useCallback(async (text: string) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.src = '';
            audioRef.current = null;
        }
        if (urlRef.current) {
            URL.revokeObjectURL(urlRef.current);
            urlRef.current = null;
        }

        const audioContent = await convertToSpeech(text);
        if (!audioContent) return;

        const audioBytes = atob(audioContent);
        const byteArray = new Uint8Array(audioBytes.length);
        for (let i = 0; i < audioBytes.length; i++) {
            byteArray[i] = audioBytes.charCodeAt(i);
        }

        const blob = new Blob([byteArray], { type: 'audio/mp3' });
        const url = URL.createObjectURL(blob);
        urlRef.current = url;

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.addEventListener('ended', () => {
            if (audioRef.current === audio) {
                audioRef.current = null;
            }
            if (urlRef.current) {
                URL.revokeObjectURL(urlRef.current);
                urlRef.current = null;
            }
        });

        try {
            audio.play();
        } catch (error) {
            console.error('Error playing audio:', error);
        }

    }, []);

    return {
        playSpeech
    };
}