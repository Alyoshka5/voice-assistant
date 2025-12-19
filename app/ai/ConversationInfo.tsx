import React from 'react';
import styles from './Assistant.module.css';

interface Props {
    assistantActivated: boolean,
    displayText: string,
    assistantResponseText: string,
    displayPanel: React.ReactNode;
}

export default function ConversationInfo({ assistantActivated, displayText, assistantResponseText, displayPanel }: Props) {
    
    return (
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
    )
}