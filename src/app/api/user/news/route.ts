import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/guards';
import { getEligibleApplicabilities, getEligibleTrackScopes } from '@/lib/eligibility';
import { Track } from '@prisma/client';

// GET /api/user/news – last 20 eligible unread precedents
export async function GET(req: NextRequest) {
    const { error, session } = await requireAuth(['USER', 'ADMIN', 'GESTOR']);
    if (error) return error;

    const userId = (session!.user as any).id as string;
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    const track: Track = (profile?.activeTrack ?? 'JUIZ') as Track;
    const apps = getEligibleApplicabilities(track);
    const scopes = getEligibleTrackScopes(track);

    const precedents = await prisma.precedent.findMany({
        where: {
            applicability: { in: apps },
            subject: { trackScope: { in: scopes as unknown as any[] } },
            reads: { none: { userId } },
        },
        include: {
            subject: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
    });

    return NextResponse.json({ precedents: precedents.map((p) => ({ ...p, isRead: false })), track });
}
