import styles from './Hero.module.css';
import { useEffect, useRef, useState } from 'react';
import ParticleOrb from "@/app/components/ParticleOrb";
import googleSignIn from "@/app/actions/google-signin";
import TestCredentialsForm from "../TestCredentialsForm";
import primaryFont from "@/app/fonts";

export default function Hero() {
    const signUpHoverRef = useRef<boolean>(false);
    const [screenWidth, setScreenWidth] = useState(1500);

    const getAmplitude = () => 50;

    const scrollToFeaturesSection = () => {
        const featuresSection = document.getElementById('features');
        if (featuresSection) {
            featuresSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    useEffect(() => {
        setScreenWidth(window.innerWidth);

        const handleResize = () => {
            const width = window.innerWidth;

            setScreenWidth(prev => {
                const wasDesktop = prev > 768;
                const isDesktop = width > 768;

                if (wasDesktop != isDesktop) {
                    return width;
                }
                return prev;
            });
        }

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, [])

    return (
        <div className={styles.content_container}>
            <div className={styles.header_container}>
                <h1 className={styles.header}>
                    Manage Your Daily Workflows with Your Voice
                </h1>
                <p className={styles.subheader}>
                    The AI voice assistant that connects your voice to the Google ecosystem. Reach the apex of your productivity by letting AI manage the manual tasks for you.
                </p>
                <div className={styles.sign_in_container}>
                    <form action={googleSignIn}>
                        <button 
                            type="submit" className={`${primaryFont.className} ${styles.sign_in_button} ${styles.page_sign_in_button}`}
                            onMouseEnter={() => signUpHoverRef.current = true}
                            onMouseLeave={() => signUpHoverRef.current = false}
                        >
                            Sign up with Google
                        </button>
                    </form>
                    {process.env.APP_ENV === 'test' && (
                        <TestCredentialsForm />
                    )}
                </div>
            </div>
            <div className={styles.orb_outer_container}>
                <div className={styles.orb_inner_container}
                    onMouseEnter={() => signUpHoverRef.current = true}
                    onMouseLeave={() => signUpHoverRef.current = false}
                    onClick={scrollToFeaturesSection}
                >
                    {screenWidth > 0 && process.env.NEXT_PUBLIC_APP_ENV === 'test' ? <h2 style={{color: 'white'}} data-testid='mock-orb'>MOCK PARTICLE ORB</h2> : (
                        <ParticleOrb getAmplitude={getAmplitude} userIsSpeakingRef={signUpHoverRef} canvasSize={ screenWidth > 800 ? 500 : 300 } />
                    )}
                </div>
            </div>
        </div>
    )
}