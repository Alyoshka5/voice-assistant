import styles from './SignOutButton.module.css';
import Icon from '@mdi/react';
import { mdiLogout } from '@mdi/js';
import signOut from "@/app/actions/signout";

export default function SignOutButton() {
    return (
        <form action={signOut} className={styles.signout_form}>
            <button type="submit" className={styles.menu_button} aria-label='Sign Out'>
                <Icon path={mdiLogout} size={1} color="#9f9fcd"/>
            </button>
        </form>
    )
}