import Icon from '@mdi/react';
import { mdiPower } from '@mdi/js';
import styles from './Assistant.module.css';
import React from 'react';

interface Props {
    assistantActivated: boolean;
    setAssistantActivated: React.Dispatch<React.SetStateAction<boolean>>;
    initAudio: () => void;
}

export default function ActivationButton({ assistantActivated, setAssistantActivated, initAudio }: Props) {

    return (
        <>
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
        </>
    )
}