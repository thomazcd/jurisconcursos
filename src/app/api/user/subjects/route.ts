import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/guards';
import { getEligibleTrackScopes, getEligibleApplicabilities } from '@/lib/eligibility';
import { Track } from '@prisma/client';

// GET /api/user/subjects – list subjects for user's active track + unread counts
export async function GET(req: NextRequest) {
    const { error, session } = await requireAuth(['USER', 'ADMIN', 'GESTOR']);
    if (error) return error;

    const userId = (session!.user as any).id as string;
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    const track: Track = (profile?.activeTrack ?? 'JUIZ') as Track;
    const scopes = getEligibleTrackScopes(track);
    const apps = getEligibleApplicabilities(track);

    const subjects = await prisma.subject.findMany({
        where: { trackScope: { in: scopes as unknown as any[] } },
        orderBy: { trackScope: 'asc' },
        include: {
            precedents: {
                where: { applicability: { in: apps } },
                select: {
                    id: true,
                    reads: { where: { userId }, select: { userId: true } },
                },
            },
        },
    });

    const result = subjects.map((s) => {
        const total = s.precedents.length;
        const readCount = s.precedents.filter((p) => p.reads.length > 0).length;
        const unreadCount = total - readCount;
        const { precedents, ...rest } = s;
        return { ...rest, total, readCount, unreadCount };
    });

    return NextResponse.json({ subjects: result, track });
}
