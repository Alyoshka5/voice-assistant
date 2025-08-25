'use client'

import styles from './Assistant.module.css'
import Icon from '@mdi/react'
import { mdiSend, mdiLogout, mdiPower } from '@mdi/js'
import signOut from "@/app/actions/signout";
import useOpenAI from "@/app/hooks/useOpenAI";
import { useEffect, useState, useRef, ReactElement } from "react";
import useSpeechRecognition from "@/app/hooks/useSpeechRecognition";
import usePlaySpeech from "../hooks/usePlaySpeech";
import YoutubePlayer from "@/app/components/panels/YoutubePlayer";
import CurrentWeatherPanel from "@/app/components/panels/currentWeatherPanel";
import FutureWeatherForecastPanel from "../components/panels/FutureWeatherForecastPanel";
import { CurrentWeatherDetails, FutureWeatherForecastDetails } from "../types/types";
import ParticleOrb from "@/app/components/ParticleOrb";

const assistantName = 'apex';

export default function Assistant() {
    const {text, isFinal, startListening, stopListening} = useSpeechRecognition();
    const [assistantResponseText, setAssistantResponseText] = useState<string>('');
    const [currentCoords, setCurrentCoords] = useState<{ latitude: number, longitude: number } | null>(null);
    const [userQuery, setUserQuery] = useState<string>('');
    const [formInputValue, setFormInputValue] = useState<string>('');
    const ignoreSpeechRef = useRef<boolean>(false);
    const [wakeWordCalled, setWakeWordCalled] = useState<boolean>(false);
    const [displayText, setDisplayText] = useState<string>('');
    const [assistantActivated, setAssistantActivated] = useState<boolean>(false);
    const [displayPanel, setDisplayPanel] = useState<ReactElement>(<></>);
    const userIsSpeakingRef = useRef<boolean>(false);

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

        const output = await getResponse(query, {
            coordinates: currentCoords, 
            date: localDate,
            time: localTime
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
            if (keyIndex >= 0) {
                userIsSpeakingRef.current = true; 
                setUserQuery(text.substring(keyIndex + assistantName.length + 1, text.length));
            }
            else if (wakeWordCalled) {
                userIsSpeakingRef.current = true;
                setUserQuery(text);
            }
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

        if (userIsSpeakingRef.current && !ignoreSpeechRef.current) {
            userIsSpeakingRef.current = false;
            getAssistantResponse(userQuery);
        }
    }, [isFinal]);

    useEffect(() => {
        if (userQuery.trim() === '')
            return;

        setDisplayText(userQuery);
    }, [userQuery]);

    return (
        <div className={styles.page}>
            <div className={styles.menu_bar}>
                { assistantActivated ?
                    ''
                :
                    <button className={`${styles.menu_button} ${styles.activate_button}`} onClick={() => {
                        setAssistantActivated(true);
                        initAudio();
                    }}>
                        <Icon path={mdiPower} size={1} color="#9f9fcd"/>
                    </button>
                }
                <form action={signOut} className={styles.signout_form}>
                    <button type="submit" className={styles.menu_button}><Icon path={mdiLogout} size={1} color="#9f9fcd"/></button>
                </form>
            </div>

            <div className={styles.assistant}>
                <div className={styles.particle_container}>
                    <ParticleOrb getAmplitude={getAmplitude} userIsSpeakingRef={userIsSpeakingRef} />
                </div>

                <div className={styles.conversation_content}>
                    <div className={styles.conversation_info}>
                        {assistantActivated ?
                            <>
                                <p className={styles.user_query}>{displayText}</p>
                                <p className={styles.assistant_response}>{assistantResponseText}</p>
                                {displayPanel}
                            </>
                        :
                            ''
                        }
                    </div>
                    {assistantActivated ?
                        <form onSubmit={handleQueryFormSubmit} className={styles.query_form}>
                            <input
                                type="text"
                                name="textQuery"
                                placeholder="Say 'Apex' or type here..."
                                value={formInputValue}
                                autoComplete="off"
                                onChange={(e) => setFormInputValue(e.target.value)}
                                />
                            <button type="submit"><Icon path={mdiSend} size={1} color="#9f9fcd"/></button>
                        </form>
                    :
                        ''
                    }
                </div>
            </div>
        </div>
    )
    
}