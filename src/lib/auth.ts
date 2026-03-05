import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { Role, Track } from '@prisma/client';

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutos em ms

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

                const email = credentials.email.toLowerCase().trim();
                const now = new Date();

                const user = await prisma.user.findUnique({
                    where: { email },
                    include: { profile: true },
                });

                if (!user) {
                    // Proteção básica: delay artificial para dificultar brute force
                    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 1000));
                    return null;
                }

                if (user.lockedUntil && user.lockedUntil > now) {
                    const remaining = Math.ceil((user.lockedUntil.getTime() - now.getTime()) / 60000);
                    throw new Error(`Muitas tentativas falhas. Tente novamente em ${remaining} minutos.`);
                }

                const passwordMatch = await bcrypt.compare(credentials.password, user.passwordHash);

                if (!passwordMatch) {
                    // Registra tentativa falha no banco
                    const newCount = user.failedLoginAttempts + 1;

                    if (newCount >= MAX_ATTEMPTS) {
                        await prisma.user.update({
                            where: { id: user.id },
                            data: { failedLoginAttempts: 0, lockedUntil: new Date(now.getTime() + LOCK_TIME) }
                        });
                    } else {
                        await prisma.user.update({
                            where: { id: user.id },
                            data: { failedLoginAttempts: newCount }
                        });
                    }

                    // Delay artificial
                    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 1000));
                    return null;
                }

                // Login bem-sucedido: limpa historico de erros no banco
                await prisma.user.update({
                    where: { id: user.id },
                    data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: now }
                });

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
                token.role = user.role;
                token.activeTrack = user.activeTrack;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as Role;
                session.user.activeTrack = token.activeTrack as Track;
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
    if (!session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'GESTOR')) {
        redirect('/user/dashboard');
    }
    return session;
}


