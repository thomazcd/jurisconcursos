import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

// Registro temporário de tentativas falhas (In-Memory)
// Nota: Em produção (Serverless), esse mapa reseta periodicamente.
const loginAttempts = new Map<string, { count: number, lockUntil: number }>();
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
                const now = Date.now();

                // Verificação de bloqueio por tentativas falhas
                const record = loginAttempts.get(email);
                if (record && record.lockUntil > now) {
                    const remaining = Math.ceil((record.lockUntil - now) / 60000);
                    throw new Error(`Muitas tentativas falhas. Tente novamente em ${remaining} minutos.`);
                }

                const user = await prisma.user.findUnique({
                    where: { email },
                    include: { profile: true },
                });

                if (!user) {
                    // Proteção básica: delay artificial para dificultar brute force
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    return null;
                }

                const passwordMatch = await bcrypt.compare(credentials.password, user.passwordHash);

                if (!passwordMatch) {
                    // Registra tentativa falha
                    const current = loginAttempts.get(email) || { count: 0, lockUntil: 0 };
                    const newCount = current.count + 1;

                    if (newCount >= MAX_ATTEMPTS) {
                        loginAttempts.set(email, { count: 0, lockUntil: now + LOCK_TIME });
                    } else {
                        loginAttempts.set(email, { count: newCount, lockUntil: 0 });
                    }

                    // Delay artificial
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    return null;
                }

                // Login bem-sucedido: limpa historico de erros
                loginAttempts.delete(email);

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


