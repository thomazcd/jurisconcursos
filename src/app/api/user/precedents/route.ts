import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getApplicabilityFilter } from '@/lib/eligibility';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    const track = profile?.activeTrack ?? 'JUIZ_ESTADUAL';

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');

    const where: any = {
        OR: getApplicabilityFilter(track),
        ...(subjectId ? { subjectId } : {}),
    };

    const precedents = await prisma.precedent.findMany({
        where,
        orderBy: [{ judgmentDate: 'desc' }, { createdAt: 'desc' }],
        include: {
            subject: { select: { name: true } },
            reads: { where: { userId }, select: { readCount: true } },
        },
        take: 500,
    });

    const result = precedents.map((p) => ({
        ...p,
        readCount: p.reads[0]?.readCount ?? 0,
        isRead: (p.reads[0]?.readCount ?? 0) > 0,
        reads: undefined,
    }));

    return NextResponse.json({ precedents: result });
}
