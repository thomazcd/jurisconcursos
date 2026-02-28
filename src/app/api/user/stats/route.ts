import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getApplicabilityFilter } from '@/lib/eligibility';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const userId = (session.user as any).id;

        const profile = await prisma.userProfile.findUnique({ where: { userId } });
        const track = profile?.activeTrack ?? 'JUIZ_ESTADUAL';
        const eligibility = getApplicabilityFilter(track as any);

        // 1. GERAL: Total vs Lidos (Informativos)
        const totalInfs = await prisma.precedent.count({ where: eligibility });
        const readInfs = await prisma.precedentRead.count({
            where: {
                userId,
                readCount: { gt: 0 },
                precedent: eligibility
            }
        });

        // 2. POR TRIBUNAL (STF vs STJ)
        const stfTotal = await prisma.precedent.count({ where: { ...eligibility, court: 'STF' } });
        const stfRead = await prisma.precedentRead.count({
            where: { userId, readCount: { gt: 0 }, precedent: { ...eligibility, court: 'STF' } }
        });

        const stjTotal = await prisma.precedent.count({ where: { ...eligibility, court: 'STJ' } });
        const stjRead = await prisma.precedentRead.count({
            where: { userId, readCount: { gt: 0 }, precedent: { ...eligibility, court: 'STJ' } }
        });

        // 3. EVENTOS DE LEITURA (Heatmap / Gráficos Temporais)
        // Pegamos todos os readEvents para processar no front (mais flexível)
        const allReads = await prisma.precedentRead.findMany({
            where: { userId, readCount: { gt: 0 } },
            select: { readEvents: true }
        });

        const events = allReads.flatMap(r => r.readEvents);

        return NextResponse.json({
            summary: {
                total: totalInfs,
                read: readInfs,
                percent: totalInfs > 0 ? Math.round((readInfs / totalInfs) * 100) : 0
            },
            byCourt: {
                STF: { total: stfTotal, read: stfRead, percent: stfTotal > 0 ? Math.round((stfRead / stfTotal) * 100) : 0 },
                STJ: { total: stjTotal, read: stjRead, percent: stjTotal > 0 ? Math.round((stjRead / stjTotal) * 100) : 0 },
            },
            events
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
