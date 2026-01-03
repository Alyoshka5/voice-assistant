import React from "react";
import styles from "./PrivacyPolicy.module.css";

export default function PrivacyPolicy() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Privacy Policy</h1>
            <p className={styles.updated}>Last updated: December 2025</p>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Introduction</h2>
                <p className={styles.text}>
                    This Privacy Policy explains how Apex Assistant accesses your information when you connect your Google Account. 
                    By using the app, you agree to the practices described in this policy.
                </p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Information We Access</h2>
                <p className={styles.text}>
                    The app requests access to certain Google services in order to provide 
                    its functionality. The specific permissions and how they are used are 
                    listed below.
                </p>

                <h3 className={styles.subtitle}>YouTube</h3>
                <p className={styles.text}>
                    With your permission, the app can:
                </p>
                <ul className={styles.list}>
                    <li>Create YouTube playlists</li>
                    <li>Add videos to playlists</li>
                </ul>
                <p className={styles.text}>
                    The app cannot delete videos or playlists.
                </p>

                <h3 className={styles.subtitle}>Google Calendar</h3>
                <p className={styles.text}>
                    With your permission, the app can:
                </p>
                <ul className={styles.list}>
                    <li>Retrieve your calendars and events</li>
                    <li>Create new events in your calendars</li>
                    <li>Edit your calendars and events</li>
                </ul>
                <p className={styles.text}>
                    The app cannot delete existing events or calendars.
                </p>

                <h3 className={styles.subtitle}>Google Tasks</h3>
                <p className={styles.text}>
                    With your permission, the app can:
                </p>
                <ul className={styles.list}>
                    <li>Create tasks and task lists</li>
                    <li>View your tasks and task lists</li>
                    <li>Edit tasks and task lists</li>
                </ul>
                <p className={styles.text}>
                    The app cannot delete tasks or task lists permanently.
                </p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>How Your Data Is Used</h2>
                <p className={styles.text}>
                    All accessed information is used solely to perform the actions you 
                    request through the app. The app does not sell your data to third 
                    parties.
                </p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Data Storage</h2>
                <p className={styles.text}>
                    Your Google account data is only used while you are actively interacting 
                    with the Assistant. You can manage permissions or revoke access from 
                    your <a href="https://myaccount.google.com/permissions" target="_blank" 
                    className={styles.link}>Google Account Permissions</a>. If you wish to 
                    request deletion of any data stored by the Assistant, you can contact us 
                    directly.
                </p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Removing Your Data</h2>
                <p className={styles.text}>
                For questions or requests regarding your data, please contact:
                </p>
                <p className={styles.contact}>contact@apexassistant.app</p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Changes to This Policy</h2>
                <p className={styles.text}>
                    This Privacy Policy may be updated occasionally. Any changes will be 
                    posted on this page with an updated revision date.
                </p>
            </section>
        </div>
    );
}
