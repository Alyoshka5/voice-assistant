'use client';

import React, { useState } from 'react';
import styles from './FAQ.module.css';

const faqData = [
    {
        question: "How does Apex access my Google account?",
        answer: <>
                    Apex uses official Google OAuth 2.0 integration. We never see your password, and you can revoke access at any time through your <a href="https://myaccount.google.com/permissions" target="_blank" className={styles.link}>Google Account Permissions</a>.
                </>
    },
    {
        question: "Is Apex free to use?",
        answer: <>Apex is completely free to use for all users!</>
    },
    {
        question: "Can Apex see my other Google files?",
        answer: <>Apex only requests permission for the specific tools you connect, like Calendar and Tasks. It cannot access anything within your Google account without your explicit consent.</>
    },
    {
        question: "Do I need to keep the Apex tab open and visible to use voice commands?",
        answer: <>Not at all! As long as the Apex tab is open somewhere in your browser, it can listen for your commands. You can switch to other tabs and Apex will still be ready to help in the background.</>
    },
    {
        question: "Is my data being recorded or sold?",
        answer: <>No. Your voice commands and data are processed to execute your requests and are not sold to third parties or used for advertising. For more information about how your data is used, see our <a href="/privacy" target="_blank" className={styles.link}>privacy policy</a>.</>
    }
];

export default function FAQ() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    return (
        <section id='faq' className={styles.faq_section}>
            <header>
                <h2 className={styles.section_title}>FAQ</h2>
            </header>

            <div className={styles.faq_container}>
                {faqData.map((item, index) => {
                    const isActive = activeIndex === index;
                    
                    return (
                        <div key={index} className={styles.faq_item}>
                            <button
                                onClick={() => setActiveIndex(isActive ? null : index)}
                                className={styles.faq_question_button}
                                aria-expanded={isActive}
                            >
                                <span>{item.question}</span>
                                <svg 
                                    className={`${styles.chevron} ${isActive ? styles.chevron_active : ''}`}
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            
                            <div className={`${styles.answer_wrapper} ${isActive ? styles.answer_wrapper_active : ''}`}>
                                <div className={styles.answer_content}>
                                    {item.answer}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}