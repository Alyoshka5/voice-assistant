import styles from './TermsAndConditions.module.css';

export default function TermsAndConditions() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Terms and Conditions</h1>
            <p className={styles.updated}>Last updated: January 2026</p>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>1. Acceptance of Terms</h2>
                <p className={styles.text}>
                    By accessing and using Apex Assistant ("the App", "we", "our", or "us"), 
                    you agree to be bound by these Terms and Conditions ("Terms"). If you do 
                    not agree to these Terms, please do not use the App.
                </p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>2. Description of Service</h2>
                <p className={styles.text}>
                    Apex Assistant is an AI-powered voice productivity tool designed to help users 
                    manage workflows by integrating with Google services. The App allows users to 
                    create tasks, schedule calendar events, and manage playlists using voice commands.
                </p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>3. Google Services & Third-Party Accounts</h2>
                <p className={styles.text}>
                    Apex Assistant relies on integration with Google APIs (Google Calendar, 
                    Google Tasks, and YouTube). By using the App, you acknowledge and agree that:
                </p>
                <ul className={styles.list}>
                    <li>
                        You must possess a valid Google Account to use the App.
                    </li>
                    <li>
                        Your use of Google services via Apex Assistant is also governed by 
                        <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className={styles.link}> Google's Terms of Service</a> and 
                        <a href="https://www.youtube.com/t/terms" target="_blank" rel="noreferrer" className={styles.link}> YouTube's Terms of Service</a>.
                    </li>
                    <li>
                        We are not responsible for any downtime, data loss, or service changes 
                        caused by the Google API platform.
                    </li>
                </ul>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>4. User Responsibilities</h2>
                <p className={styles.text}>
                    You agree to use the App only for lawful purposes. You represent that you are 
                    responsible for any voice commands issued to the assistant. You agree not to:
                </p>
                <ul className={styles.list}>
                    <li>Use the App to generate harmful, offensive, or illegal content.</li>
                    <li>Attempt to reverse engineer, decompile, or hack the App.</li>
                    <li>Interfere with the security or proper functioning of the App.</li>
                </ul>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>5. Accuracy of AI & Voice Recognition</h2>
                <p className={styles.text}>
                    Apex Assistant uses artificial intelligence and voice recognition technologies. 
                    While we strive for accuracy, these technologies are not infallible.
                </p>
                <p className={styles.text}>
                    <strong>Disclaimer:</strong> We do not guarantee that the Assistant will accurately 
                    interpret every command. You are responsible for verifying that events, tasks, 
                    and playlist modifications have been recorded correctly in your Google services. 
                    We are not liable for missed appointments, incorrect deadlines, or errors resulting 
                    from voice misinterpretation.
                </p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>6. Intellectual Property</h2>
                <p className={styles.text}>
                    The App, including its source code, design, and branding (excluding user data 
                    and third-party integrations), is the exclusive property of Apex Assistant. 
                    Your use of the App does not grant you ownership of any intellectual property rights.
                </p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>7. Limitation of Liability</h2>
                <p className={styles.text}>
                    To the fullest extent permitted by law, Apex Assistant shall not be liable for 
                    any indirect, incidental, special, consequential, or punitive damages, including 
                    but not limited to loss of data, loss of business, or missed opportunities 
                    arising from your use of the App.
                </p>
                <p className={styles.text}>
                    The App is provided on an "AS IS" and "AS AVAILABLE" basis without warranties 
                    of any kind.
                </p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>8. Changes to Terms</h2>
                <p className={styles.text}>
                    We reserve the right to modify these Terms at any time. We will notify users 
                    of significant changes by updating the "Last Updated" date at the top of this 
                    page. Continued use of the App after such changes constitutes your acceptance 
                    of the new Terms.
                </p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>9. Contact Us</h2>
                <p className={styles.text}>
                    If you have any questions about these Terms, please contact us at:
                </p>
                <p className={styles.contact}>contact@apexassistant.app</p>
            </section>
        </div>
    )
}