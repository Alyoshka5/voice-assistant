import NextAuth from "next-auth"
import Google from 'next-auth/providers/google'
import prisma from '@/app/lib/db'
 
export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
        authorization: {
            params: {
                scope: 'openid email profile https://www.googleapis.com/auth/youtube.force-ssl',
                access_type: 'offline',
            }
        }
    })],
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
        },
        async jwt({ token, account }) {
            if (account) {
              token.accessToken = account.access_token;
              token.refreshToken = account.refresh_token;
            }
            return token;
          },
        async session({ session, token }) {
            session.accessToken = token.accessToken as string | undefined;
            session.refreshToken = token.refreshToken as string | undefined;
            return session;
        },
    }
})