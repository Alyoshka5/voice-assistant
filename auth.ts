import NextAuth from "next-auth"
import Google from 'next-auth/providers/google'
import prisma from '@/app/lib/db'
import { AuthToken } from "@/app/types/types"
import { encrypt , decrypt } from '@/app/lib/encryption'

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
        authorization: {
            params: {
                scope: 'openid email profile https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/tasks',
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
            let refreshToken;
            if (account) {
                if (account.refresh_token) {
                    refreshToken = account.refresh_token;

                    const encrypted = await encrypt(refreshToken);

                    await prisma.user.update({
                        data: {
                            googleRefreshToken: encrypted.data,
                            googleRefreshTokenIv: encrypted.iv
                        },
                        where: {
                            email: token.email!
                        }
                    });
                    
                } else {
                    const user = await prisma.user.findUnique({
                        select: {
                            googleRefreshToken: true,
                            googleRefreshTokenIv: true
                        },
                        where: {
                            email: token.email!
                        }
                    });

                    if (!user)
                        return token;

                    const encryptedRefreshToken = user.googleRefreshToken;
                    const encryptedRefreshTokenIv = user.googleRefreshTokenIv

                    if (!encryptedRefreshToken || !encryptedRefreshTokenIv)
                        return token;

                    refreshToken = await decrypt(encryptedRefreshToken, encryptedRefreshTokenIv);
                }

                return {
                    ...token,
                    accessToken: account.access_token,
                    refreshToken: refreshToken,
                    accessTokenExpires: Date.now() + (account.expires_in ?? 0) * 1000,
                }
            }
            
            if (typeof token.accessTokenExpires === 'number' && Date.now() < token.accessTokenExpires) {
                return token;
            }

            return await refreshGoogleAccessToken(token as AuthToken);
          },
        async session({ session, token }) {
            session.accessToken = token.accessToken as string | undefined;
            session.refreshToken = token.refreshToken as string | undefined;
            session.accessTokenExpires = token.accessTokenExpires as number | undefined;
            if (token.error) {
                session.error = token.error as string | undefined;
            }
            return session;
        },
    }
})

async function refreshGoogleAccessToken(token: AuthToken) {
    try {
        const url = 'https://oauth2.googleapis.com/token';
        const params = new URLSearchParams({
            client_id: process.env.AUTH_GOOGLE_ID!,
            client_secret: process.env.AUTH_GOOGLE_SECRET!,
            grant_type: 'refresh_token',
            refresh_token: token.refreshToken,
        });

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });

        const refreshed = await res.json();

        if (!res.ok) {
            throw refreshed;
        }

        return {
            ...token,
            accessToken: refreshed.access_token,
            refreshToken: refreshed.refresh_token ?? token.refreshToken,
            accessTokenExpires: Date.now() + refreshed.expires_in * 1000,
            error: undefined
        }

    } catch (error) {
        console.error('Error refreshing access token:', error);
        return {
            ...token,
            error: 'RefreshAccessTokenError'
        }
    }
}