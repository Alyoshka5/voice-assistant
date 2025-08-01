'use client';
import { useCallback, useEffect, useRef, useState } from "react";

export default function useSpeechRecognition() {
    const [text, setText] = useState<string>("");
    const [isFinal, setIsFinal] = useState<boolean>(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const SpeechRecognitionContructor = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionContructor) return;
        
        const recognition = new SpeechRecognitionContructor();
        if (!recognition) return;
        recognition.interimResults = true;
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
            setIsFinal(event.results[0].isFinal);
            const transcript = Array.from(event.results)
                .map((result: any) => result[0].transcript)
                .join('');
            setText(transcript);
        }

        recognition.onend = () => {
            recognition.start();
        }

        recognitionRef.current = recognition;

        return () => {
            recognition.onresult = null;
            recognition.onend = null;
            recognition.stop();
            recognitionRef.current = null;
        }
    }, []);

    const startListening = useCallback(() => {
        setText('');
        setIsFinal(false);
        recognitionRef.current?.start();
    }, []);

    const stopListening = useCallback(() => {
        recognitionRef.current?.stop();
    }, []);

    return {
        text,
        isFinal,
        startListening,
        stopListening,
    }
}