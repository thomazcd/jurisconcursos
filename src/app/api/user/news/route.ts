import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/guards';
import { getApplicabilityFilter, getEligibleTrackScopes } from '@/lib/eligibility';
import { Track } from '@prisma/client';

// GET /api/user/news – last 30 eligible unread precedents
export async function GET(req: NextRequest) {
    const { error, session } = await requireAuth(['USER', 'ADMIN', 'GESTOR']);
    if (error) return error;

    const userId = (session!.user as any).id as string;
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    const track: Track = (profile?.activeTrack ?? 'JUIZ_ESTADUAL') as Track;
    const appFilter = getApplicabilityFilter(track);
    const scopes = getEligibleTrackScopes(track);

    const precedents = await prisma.precedent.findMany({
        where: {
            ...appFilter,
            subjects: { some: { trackScope: { in: scopes as any[] } } },
            reads: { none: { userId } },
        },
        include: {
            subjects: { select: { id: true, name: true } },
        },
        orderBy: [{ judgmentDate: 'desc' }, { createdAt: 'desc' }],
        take: 30,
    });

    return NextResponse.json({ precedents: precedents.map((p) => ({ ...p, isRead: false })), track });
}
