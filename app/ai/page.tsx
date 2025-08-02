'use client'

import signOut from "@/app/actions/signout";
import useOpenAI from "@/app/hooks/useOpenAI";
import { useEffect, useState, useRef } from "react";
import useSpeechRecognition from "@/app/hooks/useSpeechRecognition";

const assistantName = 'apex';

export default function Assistant() {
    const {text, isFinal, startListening, stopListening} = useSpeechRecognition();
    const [assistantResponseText, setAssistantResponseText] = useState<string>('');
    const [currentCoords, setCurrentCoords] = useState<{ latitude: number, longitude: number } | null>(null);
    const [userQuery, setUserQuery] = useState<string>('');
    const [userIsSpeaking, setUserIsSpeaking] = useState<boolean>(false);
    const [formInputValue, setFormInputValue] = useState<string>('');
    const ignoreSpeechRef = useRef<boolean>(false);
    const [wakeWordCalled, setWakeWordCalled] = useState<boolean>(false);

    const { getResponse } = useOpenAI();

    const getAssistantResponse = async (query: string) => {
        const date = new Date();
        const localDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        const output = await getResponse(query, {
            coordinates: currentCoords, 
            date: localDate
        });

        if (output !== null && output !== '') {
            setAssistantResponseText(output.outputText);

        }
    }

    const handleQueryFormSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!formInputValue || formInputValue.trim() === '')
            return;

        setFormInputValue('');
        ignoreSpeechRef.current = true; // ignore any speech input while form is submitted
        setUserIsSpeaking(false);
        stopListening(); // will automatically start listening after
        setUserQuery(formInputValue);
        await getAssistantResponse(formInputValue);
        setTimeout(() => {
            ignoreSpeechRef.current = false;
        }, 300);
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
        
        if (!ignoreSpeechRef.current) {
            setUserIsSpeaking(true);
            
            if (keyIndex >= 0) 
                setUserQuery(text.substring(keyIndex + assistantName.length + 1, text.length));
            else if (wakeWordCalled)
                setUserQuery(text);

        }
    }, [text]);

    useEffect(() => {
        if (!isFinal) return;
        if (userQuery.trim() === '') // assistant called without query
            setWakeWordCalled(true); // listen to query in the next line

        if (wakeWordCalled)
            setWakeWordCalled(false);

        if (userIsSpeaking && !ignoreSpeechRef.current) {
            setUserIsSpeaking(false);
            getAssistantResponse(userQuery);
        }
    }, [isFinal]);

    return (
        <div>
            <p>{userQuery}</p>
            <form onSubmit={handleQueryFormSubmit}>
                <input
                    type="text"
                    name="textQuery"
                    placeholder="Type to Apex..."
                    value={formInputValue}
                    onChange={(e) => setFormInputValue(e.target.value)}
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