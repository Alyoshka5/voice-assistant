import Image from "next/image";
import styles from './Features.module.css';

const categories = [
    {
        headerTitle: 'Google Calendar',
        iconPath: '/google-calendar-icon.png',
        iconAltText: 'Google Calendar Icon',
        iconWidth: 32,
        iconHeight: 32,
        panels: [
            'Schedule lunch with Mark at 1pm tomorrow',
            'Where is my work meeting going to be?',
            'What are my upcoming school events?'
        ]
    },
    {
        headerTitle: 'Google Tasks',
        iconPath: '/google-tasks-icon.png',
        iconAltText: 'Google Tasks Icon',
        iconWidth: 32,
        iconHeight: 32,
        panels: [
            'Add English essay to my school list',
            'Check off budget proposal as done in my work list',
            'Set the deadline for my calculus problem set to friday',
            'What todo lists do I have?',
            'I need a list for my Q1 Marketing Launch',
            'What\'s left to do on my Applications list?'
        ]
    },
    {
        headerTitle: 'YouTube',
        iconPath: '/youtube-icon.png',
        iconAltText: 'YouTube Icon',
        iconWidth: 40,
        iconHeight: 28,
        panels: [
            'Find me a video on how to change my background in Zoom',
            'I like that tutorial, add it to my study resources playlist on YouTube',
            'Find a lofi beats video for deep focus'
        ]
    },
    {
        headerTitle: 'Weather',
        iconPath: '/weather-icon.png',
        iconAltText: 'Weather Icon',
        iconWidth: 42,
        iconHeight: 42,
        panels: [
            'Is it cold outside?',
            'Is it raining tomorrow?',
            'What\'s the weather like in Hawaii right now?'
        ]
    },
    {
        headerTitle: 'Intelligence for Every Interaction',
        iconPath: '/brain-icon.png',
        iconAltText: 'Brain Icon',
        iconWidth: 34,
        iconHeight: 34,
        panels: [
            'Explain quantum tunnelling like I\'m five',
            'Help me practice for my interview',
            'What will the date be next Monday?'
        ]
    },
]

export default function Features() {

    return (
        <section id='features' className={styles.container}>
            <h2>Explore Capabilities</h2>
            <p className={styles.subheader}>Discover what you can do with Apex</p>
            {categories.map(category => (
                <div key={category.headerTitle} className={styles.category_container}>
                    <div className={styles.category_header}>
                        <Image 
                            src={category.iconPath}
                            alt={category.iconAltText}
                            width={category.iconWidth}
                            height={category.iconHeight}
                        />
                        <h3>{category.headerTitle}</h3>
                    </div>
                    <div className={styles.feature_panels}>
                        {category.panels.map(panelText => (
                            <div key={panelText} className={styles.feature_panel}>"{panelText}"</div>
                        ))}
                    </div>
                </div>
            ))}
        </section>
    )
}