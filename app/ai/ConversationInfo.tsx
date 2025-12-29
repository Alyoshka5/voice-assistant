import React from 'react';
import styles from './Assistant.module.css';

interface Props {
    displayText: string,
    assistantResponseText: string,
    displayPanel: React.ReactNode;
}

export default function ConversationInfo({ displayText, assistantResponseText, displayPanel }: Props) {
    
    return (
        <div className={styles.conversation_info} >
            <p className={styles.user_query}>{displayText}</p>
            <p className={styles.assistant_response}>{assistantResponseText}</p>
            {displayPanel}
        </div>
    )
}