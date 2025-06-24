'use server'

import { signIn } from '@/auth';

export default async function googleSignIn() {
    await signIn("google");
} 