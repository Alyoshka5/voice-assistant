'use client'

import convertToSpeech from "@/app/actions/convertTextToSpeech";

export default function usePlaySpeech() {
    const playSpeech =  async (text: string) => {
        const audioContent = await convertToSpeech(text);

        if (!audioContent) return;
        const audioBytes = atob(audioContent);
        const byteArray = new Uint8Array(audioBytes.length);
        for (let i = 0; i < audioBytes.length; i++) {
            byteArray[i] = audioBytes.charCodeAt(i);
        }

        const blob = new Blob([byteArray], { type: 'audio/mp3' });
        const url = URL.createObjectURL(blob);

        const audio = new Audio(url);
        audio.play();
    };

    return {
        playSpeech
    };
}