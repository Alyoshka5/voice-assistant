'use client'

import convertToSpeech from "@/app/actions/convertTextToSpeech";
import { useCallback, useRef } from "react";

export default function usePlaySpeech() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const urlRef = useRef<string | null>(null);

    const initAudio = useCallback(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.autoplay = false;
        }
    }, []);

    const playSpeech = useCallback(async (text: string) => {
        if (!audioRef.current) {
            return;
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

        audioRef.current.src = url;

        try {
            audioRef.current.play();
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    }, []);

    return {
        initAudio,
        playSpeech
    };
}