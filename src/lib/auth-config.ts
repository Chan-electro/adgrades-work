import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: "openid email profile https://www.googleapis.com/auth/calendar",
                    access_type: "offline",
                    prompt: "consent",
                },
            },
        }),
        Credentials({
            name: "Test User",
            credentials: {},
            async authorize(credentials) {
                // Create or get test user
                const email = "test@example.com";
                const user = await prisma.user.upsert({
                    where: { email },
                    update: {},
                    create: {
                        email,
                        name: "Test User",
                        image: "https://ui-avatars.com/api/?name=Test+User",
                    },
                });
                return user;
            },
        }),
    ],
    callbacks: {
        async session({ session, user, token }) {
            if (session.user) {
                // For credentials provider, user id comes from token.sub
                if (token?.sub) {
                    session.user.id = token.sub;
                } else if (user?.id) {
                    session.user.id = user.id;
                }
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
            }
            return token;
        }
    },
    session: {
        strategy: "jwt", // Use JWT strategy for credentials provider compatibility
    },
    pages: {
        signIn: "/scheduler/login",
    },
});
