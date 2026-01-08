'use client'

import styles from './page.module.css';
import FAQ from "./components/landingPage/FAQ";
import Features from "./components/landingPage/Features";
import Hero from "./components/landingPage/Hero";
import NavBar from './components/landingPage/NavBar';

export default function Home() {
    return (
        <div className={styles.container}>
            <NavBar />
            <Hero />
            <Features />
            <FAQ />
        </div>
    );
}