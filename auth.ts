import NextAuth from "next-auth"
import Google from 'next-auth/providers/google'
import prisma from '@/app/lib/db'
 
export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [Google],
    callbacks: {
        async signIn({ profile }) {
            if (!profile) return false;

            const existingUser = await prisma.user.findUnique({
                where: { email: profile.email ?? undefined}
            })

            if (!existingUser && profile.email) {
                await prisma.user.create({
                    data: {
                      name: profile.name,
                      email: profile.email || '',
                    },
                })
            }

            return true;
        }
    }
})