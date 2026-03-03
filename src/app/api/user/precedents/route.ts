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
        const profile = await prisma.userProfile.findUnique({
            where: { userId },
            include: { selectedSubjects: { select: { id: true } } }
        });
        const track = (profile?.activeTrack ?? 'JUIZ_ESTADUAL') as any;
        const selectedSubjectIds = profile?.selectedSubjects.map(s => s.id) || [];

        const { searchParams } = new URL(req.url);
        const subjectId = searchParams.get('subjectId');
        const q = searchParams.get('q');

        // Centralizado! O Serviço puxa do Banco (incluindo o pai Informatory) e amarra estatísticas
        const precedents = await PrecedentService.getForUser({
            track,
            userId,
            subjectId,
            q,
            selectedSubjectIds,
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
