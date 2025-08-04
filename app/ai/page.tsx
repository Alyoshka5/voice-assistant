'use client'

import signOut from "@/app/actions/signout";
import useOpenAI from "@/app/hooks/useOpenAI";
import { useEffect, useState, useRef, ReactElement } from "react";
import useSpeechRecognition from "@/app/hooks/useSpeechRecognition";
import usePlaySpeech from "../hooks/usePlaySpeech";
import YoutubePlayer from "@/app/components/panels/YoutubePlayer";
import CurrentWeatherPanel from "@/app/components/panels/currentWeatherPanel";
import { CurrentWeatherDetails } from "../types/types";

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
    const [displayText, setDisplayText] = useState<string>('');
    const [assistantActivated, setAssistantActivated] = useState<boolean>(false);
    const [displayPanel, setDisplayPanel] = useState<ReactElement>(<></>);

    const { getResponse } = useOpenAI();
    const { playSpeech } = usePlaySpeech();

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
            const outputText = output.outputText.trim().replaceAll('&quot;', '"');
            setAssistantResponseText(outputText);
            setUserQuery('');
            handleResponseActions(output.action || '', output.details || {});
            playSpeech(outputText);
        }
    }

    const handleResponseActions = (action: string, details: Record<string, string | number | undefined>) => {
        switch (action) {
            case 'displayCurrentWeatherTab':
                console.log('heree')
                setDisplayPanel(<CurrentWeatherPanel details={details as CurrentWeatherDetails} />)
                break;

            case 'displayYoutubeVideo':
                if (details.videoId) {
                    setDisplayPanel(<YoutubePlayer videoId={details.videoId as string} />);
                }
                break;

            default:
                setDisplayPanel(<></>);
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
    }, []);

    useEffect(() => {
        if (assistantActivated) {
            try {
                startListening();
            } catch (error) {
                alert("Error starting speech recognition:" + error);
            }
        }
    }, [assistantActivated]);

    useEffect(() => {
        const keyIndex = text.toLowerCase().indexOf(assistantName);
        
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
        if (userQuery.trim() === '') { // assistant called without query
            const keyIndex = text.toLowerCase().indexOf(assistantName);
            if (keyIndex >= 0) // no wake word detected
                setWakeWordCalled(true); // listen to query in the next line
            return;
        }

        if (wakeWordCalled)
            setWakeWordCalled(false);

        if (userIsSpeaking && !ignoreSpeechRef.current) {
            setUserIsSpeaking(false);
            getAssistantResponse(userQuery);
        }
    }, [isFinal]);

    useEffect(() => {
        if (userQuery.trim() === '')
            return;

        setDisplayText(userQuery);
    }, [userQuery]);

    return (
        <div>
            {assistantActivated ?
                <>
                    <p>{displayText}</p>
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
                    {displayPanel}
                </>
            :
                <button onClick={() => setAssistantActivated(true)}>
                    Activate Apex
                </button>
            }

            <form action={signOut}>
                <button type="submit">Sign Out</button>
            </form>
        </div>
    )
    
}