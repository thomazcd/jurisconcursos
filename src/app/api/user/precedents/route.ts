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
        const track = (profile?.activeTrack ?? 'JUIZ_ESTADUAL') as any;

        const { searchParams } = new URL(req.url);
        const subjectId = searchParams.get('subjectId');
        const q = searchParams.get('q'); // Search query

        // Core Filters
        const appFilter = getApplicabilityFilter(track);
        const where: any = { ...appFilter };

        if (subjectId && subjectId !== 'ALL') {
            where.subjectId = subjectId;
        }
        if (q) {
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { summary: { contains: q, mode: 'insensitive' } },
                { theme: { contains: q, mode: 'insensitive' } },
                { processNumber: { contains: q, mode: 'insensitive' } }
            ];
        }

        const precedents = await prisma.precedent.findMany({
            where,
            orderBy: [{ judgmentDate: 'desc' }, { createdAt: 'desc' }],
            include: {
                subject: { select: { name: true } },
            },
            distinct: ['processNumber', 'processClass', 'title'],
            take: 500,
        });

        // Fetch User's Specific Data separately (PrecedentRead)
        const reads = await prisma.precedentRead.findMany({
            where: { userId, precedent: appFilter }
        });
        const readMap = new Map<string, any>(reads.map((r: any) => [r.precedentId, r]));

        const result = precedents.map((p: any) => {
            const r = readMap.get(p.id);
            return {
                ...p,
                readCount: r?.readCount ?? 0,
                isRead: (r?.readCount ?? 0) > 0,
                readEvents: r?.readEvents ?? [],
                correctCount: r?.correctCount ?? 0,
                wrongCount: r?.wrongCount ?? 0,
                lastResult: r?.lastResult ?? null,
                isFavorite: r?.isFavorite ?? false,
                notes: r?.notes ?? null,
            };
        });

        return NextResponse.json({ precedents: result });
    } catch (err: any) {
        console.error('ERROR in GET /api/user/precedents:', err);
        return NextResponse.json({
            error: err.message,
            stack: err.stack
        }, { status: 500 });
    }
}
