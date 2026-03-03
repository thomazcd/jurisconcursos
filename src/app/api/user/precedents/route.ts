import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/guards';
import { prisma } from '@/lib/prisma';
import { PrecedentService } from '@/services/PrecedentService';
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    noStore();
    try {
        const { error, session } = await requireAuth(['USER', 'ADMIN', 'GESTOR']);
        if (error) return error;

        const userId = (session!.user as any).id;

        const { searchParams } = new URL(req.url);
        const subjectId = searchParams.get('subjectId');
        const subjectIds = searchParams.getAll('subjectIds');
        const q = searchParams.get('q');

        // Centralizado! O Serviço puxa do Banco (incluindo o pai Informatory) e amarra estatísticas
        const precedents = await PrecedentService.getForUser({
            userId,
            subjectId,
            subjectIds,
            q,
            limit: 500
        });

        return NextResponse.json({ precedents });
    } catch (err: any) {
        console.error('ERROR in GET /api/user/precedents:', err);
        return NextResponse.json({
            error: 'Erro interno ao carregar precedentes.',
            details: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        }, { status: 500 });
    }
}
