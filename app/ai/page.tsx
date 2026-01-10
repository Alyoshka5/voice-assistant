'use client'

import styles from './Assistant.module.css'
import useOpenAI from "@/app/hooks/useOpenAI";
import { useEffect, useState, useRef, ReactElement } from "react";
import useSpeechRecognition from "@/app/hooks/useSpeechRecognition";
import usePlaySpeech from "../hooks/usePlaySpeech";
import YoutubePlayer from "@/app/components/panels/YoutubePlayer";
import CurrentWeatherPanel from "@/app/components/panels/currentWeatherPanel";
import FutureWeatherForecastPanel from "../components/panels/FutureWeatherForecastPanel";
import { CurrentWeatherDetails, FutureWeatherForecastDetails } from "../types/types";
import ParticleOrb from "@/app/components/ParticleOrb";
import ActivationButton from './ActivationButton';
import SignOutButton from '@/app/components/SignOutButton';
import ConversationInfo from './ConversationInfo';
import QueryForm from './QueryForm';
import { useSession } from 'next-auth/react';

const assistantName = 'apex';

export default function Assistant() {
    const {text, isFinal, startListening, stopListening} = useSpeechRecognition();
    const [assistantResponseText, setAssistantResponseText] = useState<string>('');
    const [currentCoords, setCurrentCoords] = useState<{ latitude: number, longitude: number } | null>(null);
    const [userQuery, setUserQuery] = useState<string>('');
    const queryRef = useRef<string>('');
    const [formInputValue, setFormInputValue] = useState<string>('');
    const ignoreSpeechRef = useRef<boolean>(false);
    const [wakeWordCalled, setWakeWordCalled] = useState<boolean>(false);
    const [displayText, setDisplayText] = useState<string>('\u00A0');
    const [assistantActivated, setAssistantActivated] = useState<boolean>(false);
    const [displayPanel, setDisplayPanel] = useState<ReactElement>(<></>);
    const userIsSpeakingRef = useRef<boolean>(false);
    const { data: session } = useSession();

    const [isMounted, setIsMounted] = useState(false);

    const { getResponse } = useOpenAI();
    const { initAudio, playSpeech, getAmplitude } = usePlaySpeech();

    const getAssistantResponse = async (query: string) => {
        const date = new Date();
        const localDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        const localTime = date.toLocaleTimeString('en-US');
        const isoNow = date.toISOString();
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const output = await getResponse(query, {
            coordinates: currentCoords, 
            date: localDate,
            time: localTime,
            isoNow: isoNow,
            timeZone: userTimeZone
        });

        if (output !== null) {
            const outputText = output.outputText.trim().replaceAll('&quot;', '"');
            setAssistantResponseText(outputText);
            queryRef.current = '';
            setUserQuery('');
            handleResponseActions(output.action || '', output.details || {});
            playSpeech(outputText);
        }
    }

    const handleResponseActions = (action: string, details: Record<string, string | number | undefined>) => {
        switch (action) {
            case 'displayCurrentWeatherTab':
                setDisplayPanel(<CurrentWeatherPanel details={details as CurrentWeatherDetails} />)
                break;

            case 'displayForecastWeatherTab':
                setDisplayPanel(<FutureWeatherForecastPanel details={details as FutureWeatherForecastDetails} />)
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
        userIsSpeakingRef.current = false;
        stopListening(); // will automatically start listening after
        queryRef.current = formInputValue;
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
            setAssistantResponseText('Welcome. Just say \'Apex\' to start. You\'ll see the orb turn blue when I\'m listening for your request.')
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
            if (keyIndex >= 0) {
                userIsSpeakingRef.current = true; 
                let query = text.substring(keyIndex + assistantName.length + 1, text.length);
                query = query.charAt(0).toUpperCase() + query.slice(1);
                queryRef.current = query;
                setUserQuery(query);
            }
            else if (wakeWordCalled) {
                userIsSpeakingRef.current = true;
                let query = text.charAt(0).toUpperCase() + text.slice(1);
                queryRef.current = query;
                setUserQuery(query);
            }
        }
    }, [text]);

    useEffect(() => {
        if (!isFinal) return;
        if (queryRef.current.trim() === '') { // assistant called without query
            const keyIndex = text.toLowerCase().indexOf(assistantName);
            if (keyIndex >= 0) // no wake word detected
                setWakeWordCalled(true); // listen to query in the next line
            return;
        }

        if (wakeWordCalled)
            setWakeWordCalled(false);

        if (userIsSpeakingRef.current && !ignoreSpeechRef.current) {
            userIsSpeakingRef.current = false;
            getAssistantResponse(queryRef.current);
        }
    }, [isFinal]);

    useEffect(() => {
        if (userQuery.trim() === '')
            return;

        setDisplayText(userQuery);
    }, [userQuery]);

    useEffect(() => {
        if (!assistantActivated && session?.user?.name) {
            setAssistantResponseText(`Hello, ${session.user.name.split(' ')[0]}. Tap the orb to initialize Apex.`);
        }
    }, [session])

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <div className={styles.page} data-mounted={isMounted}>
            <div className={styles.menu_bar}>
                <ActivationButton assistantActivated={assistantActivated} setAssistantActivated={setAssistantActivated} initAudio={initAudio} />
                <SignOutButton />
            </div>

            <div className={styles.assistant}>
                <div className={`${styles.particle_container} ${!assistantActivated ? styles.active_particle_container : ''}`}
                    onClick={() => {
                        if (!assistantActivated) {
                            setAssistantActivated(true);
                            initAudio();
                            userIsSpeakingRef.current = false;
                        }
                    }}
                    onMouseEnter={() => {if (!assistantActivated) userIsSpeakingRef.current = true}}
                    onMouseLeave={() => {if (!assistantActivated) userIsSpeakingRef.current = false}}
                >
                    {process.env.NEXT_PUBLIC_APP_ENV === 'test' ? <h2 style={{color: 'white'}} data-testid='mock-orb'>MOCK PARTICLE ORB</h2> :
                        <ParticleOrb getAmplitude={getAmplitude} userIsSpeakingRef={userIsSpeakingRef} />
                    }
                </div>

                <div className={styles.conversation_content} data-testid='conversation-content'>
                    <ConversationInfo displayText={displayText} assistantResponseText={assistantResponseText} displayPanel={displayPanel} />
                    { assistantActivated && <QueryForm handleQueryFormSubmit={handleQueryFormSubmit} formInputValue={formInputValue} setFormInputValue={setFormInputValue} /> }
                </div>
            </div>
        </div>
    )
}