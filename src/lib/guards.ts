import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';

export async function requireAuth(allowedRoles?: Role[]) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return { error: NextResponse.json({ error: 'Não autorizado' }, { status: 401 }), session: null };
    }
    const userRole = (session.user as any).role as Role;
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return { error: NextResponse.json({ error: 'Acesso negado' }, { status: 403 }), session: null };
    }
    return { error: null, session };
}
