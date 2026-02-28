import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'GESTOR') {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const subjectCount = await prisma.subject.count();
        return NextResponse.json({
            status: 'Conectado!',
            message: `O banco está funcionando e tem ${subjectCount} matérias cadastradas.`,
            envCheck: !!process.env.DATABASE_URL
        });
    } catch (err: any) {
        return NextResponse.json({
            status: 'Erro de Conexão',
            error: err.message,
            code: err.code,
            hint: 'Verifique se você rodou o arquivo database.sql no Supabase e se a senha na Vercel tem o %40 no lugar do @.'
        }, { status: 500 });
    }
}
