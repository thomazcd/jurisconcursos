import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/guards';
import { prisma } from '@/lib/prisma';
import { PrecedentService } from '@/services/PrecedentService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { error, session } = await requireAuth(['USER', 'ADMIN', 'GESTOR']);
        if (error) return error;

        const userId = (session!.user as any).id;
        const profile = await prisma.userProfile.findUnique({ where: { userId } });
        const track = (profile?.activeTrack ?? 'JUIZ_ESTADUAL') as any;

        const { searchParams } = new URL(req.url);
        const subjectId = searchParams.get('subjectId');
        const q = searchParams.get('q');

        // Centralizado! O Serviço puxa do Banco (incluindo o pai Informatory) e amarra estatísticas
        const precedents = await PrecedentService.getForUser({
            track,
            userId,
            subjectId,
            q,
            limit: 500
        });

        return NextResponse.json({ precedents });
    } catch (err: any) {
        console.error('ERROR in GET /api/user/precedents:', err);
        return NextResponse.json({
            error: 'Erro interno ao carregar precedentes.'
        }, { status: 500 });
    }
}
