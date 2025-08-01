'use client'

import signOut from "@/app/actions/signout";
import useOpenAI from "@/app/hooks/useOpenAI";
import { useEffect, useState } from "react";

export default function Assistant() {
    const [assistantResponseText, setAssistantResponseText] = useState<string>('');
    const [currentCoords, setCurrentCoords] = useState<{ latitude: number, longitude: number } | null>(null);

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
    }, []);

    return (
        <div>
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