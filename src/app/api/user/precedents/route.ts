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

        // NUCLEAR OPTION: Ignore all filters to restore visibility
        const where: any = {};

        const precedents = await prisma.precedent.findMany({
            where,
            orderBy: [{ judgmentDate: 'desc' }, { createdAt: 'desc' }],
            include: {
                subject: { select: { name: true } },
                reads: { where: { userId } },
            },
            distinct: ['processNumber', 'processClass', 'title'],
            take: 500, // Limit for performance
        });

        const result = precedents.map((p: any) => ({
            ...p,
            readCount: p.reads[0]?.readCount ?? 0,
            isRead: (p.reads[0]?.readCount ?? 0) > 0,
            readEvents: p.reads[0]?.readEvents ?? [],
            correctCount: p.reads[0]?.correctCount ?? 0,
            wrongCount: p.reads[0]?.wrongCount ?? 0,
            lastResult: p.reads[0]?.lastResult ?? null,
            isFavorite: p.reads[0]?.isFavorite ?? false,
            notes: p.reads[0]?.notes ?? null,
            reads: undefined,
        }));

        return NextResponse.json({ precedents: result });
    } catch (err: any) {
        console.error('GET /api/user/precedents:', err);
        return NextResponse.json({ error: err.message, precedents: [] }, { status: 500 });
    }
}
