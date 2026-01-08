import primaryFont from "@/app/fonts";
import googleSignIn from "@/app/actions/google-signin";
import Image from "next/image";
import styles from './NavBar.module.css';

export default function NavBar() {
    return (
        <nav className={styles.nav}>
            <div className={styles.logo_container}>
                <Image
                    src="/favicon.svg"
                    alt='APEX Logo'
                    width={32}
                    height={32}
                    priority
                />
                <div>APEX</div>
            </div>
            <div className={styles.right_side_container}>
                <a href="#features" className={styles.link}>Features</a>
                <a href="#faq" className={styles.link}>FAQ</a>
                <form action={googleSignIn}>
                    <button type="submit" className={`${primaryFont.className} ${styles.sign_in_button} ${styles.nav_sign_in_button}`}>
                        Sign in
                    </button>
                </form>
            </div>
        </nav>
    )
}