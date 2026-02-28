import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export const authOptions: NextAuthOptions = {
    session: { strategy: 'jwt' },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Senha', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: { profile: true },
                });

                if (!user) return null;

                const passwordMatch = await bcrypt.compare(credentials.password, user.passwordHash);
                if (!passwordMatch) return null;

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    activeTrack: user.profile?.activeTrack ?? 'JUIZ_ESTADUAL',
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.activeTrack = (user as any).activeTrack;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                (session.user as any).id = token.id as string;
                (session.user as any).role = token.role as Role;
                (session.user as any).activeTrack = token.activeTrack as string;
            }
            return session;
        },
    },
};

export default NextAuth(authOptions);

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export async function requireAuth() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');
    return session;
}

export async function requireAdmin() {
    const session = await requireAuth();
    if (!session.user || ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'GESTOR')) {
        redirect('/user/dashboard');
    }
    return session;
}


