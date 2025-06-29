'use server'

import { signOut as authSignOut } from '@/auth';

export default async function signOut() {
    await authSignOut({ redirectTo: '/' });
}