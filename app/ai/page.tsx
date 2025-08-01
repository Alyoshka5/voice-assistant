'use client'

import signOut from "@/app/actions/signout";
import useOpenAI from "@/app/hooks/useOpenAI";
import { useEffect, useState } from "react";
import useSpeechRecognition from "@/app/hooks/useSpeechRecognition";

const assistantName = 'apex';

export default function Assistant() {
    const {text, isFinal, startListening, stopListening} = useSpeechRecognition();
    const [assistantResponseText, setAssistantResponseText] = useState<string>('');
    const [currentCoords, setCurrentCoords] = useState<{ latitude: number, longitude: number } | null>(null);
    const [userQuery, setUserQuery] = useState<string>('');

    const { getResponse } = useOpenAI();

    const getAssistantResponse = async (formData: FormData) => {
        const date = new Date();
        const localDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        const query: string = formData.get('textQuery') as string;
        if (!query || query.trim() === '')
            return;

        const output = await getResponse(query, {
            coordinates: currentCoords, 
            date: localDate
        });

        if (output !== null && output !== '') {
            setAssistantResponseText(output.outputText);

        }
    }

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            setCurrentCoords({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            });
        });

        try {
            startListening();
        } catch (error) {
            alert("Error starting speech recognition:" + error);
        }
    }, []);

    useEffect(() => {
        let keyIndex = text.toLowerCase().indexOf(assistantName);
        
        if (keyIndex >= 0) {
            setUserQuery(text.substring(keyIndex + assistantName.length + 1, text.length));
        }
    }, [text]);

    return (
        <div>
            <p>{userQuery}</p>
            <form action={getAssistantResponse}>
                <input
                    type="text"
                    name="textQuery"
                    placeholder="Type to Apex..."
                />
                <button type="submit">Send</button>
            </form>
            <p>{assistantResponseText}</p>

            <form action={signOut}>
                <button type="submit">Sign Out</button>
            </form>
        </div>
    )
    
}