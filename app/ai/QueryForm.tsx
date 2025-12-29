import styles from './Assistant.module.css';
import React from 'react';
import Icon from '@mdi/react';
import { mdiSend } from '@mdi/js';

interface Props {
    handleQueryFormSubmit: (event: React.FormEvent) => void;
    formInputValue: string;
    setFormInputValue:  React.Dispatch<React.SetStateAction<string>>;
}

export default function QueryForm({ handleQueryFormSubmit, formInputValue, setFormInputValue }: Props) {
    
    return (
        <form onSubmit={handleQueryFormSubmit} className={styles.query_form} aria-label='form'>
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
    )
}