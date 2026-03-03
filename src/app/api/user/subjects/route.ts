import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/guards';
import { getSubjectFilter, getApplicabilityFilter } from '@/lib/eligibility';
import { Track } from '@prisma/client';
import { unstable_noStore as noStore } from 'next/cache';

// GET /api/user/subjects – list subjects for user's active track + unread counts
export async function GET(req: NextRequest) {
    noStore();
    const { error, session } = await requireAuth(['USER', 'ADMIN', 'GESTOR']);
    if (error) return error;

    const userId = (session!.user as any).id as string;
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    const track: Track = (profile?.activeTrack ?? 'JUIZ_ESTADUAL') as Track;
    const subjectFilter = getSubjectFilter(track);
    const appFilter = getApplicabilityFilter(track);

    const subjects = await prisma.subject.findMany({
        where: subjectFilter,
        orderBy: { name: 'asc' },
        include: {
            precedents: {
                where: appFilter,
                select: {
                    id: true,
                    reads: { where: { userId }, select: { userId: true } },
                },
            },
        },
    });

    const result = subjects.map((s: any) => {
        const total = s.precedents.length;
        const readCount = s.precedents.filter((p: any) => p.reads.length > 0).length;
        const unreadCount = total - readCount;
        const { precedents, ...rest } = s;
        return { ...rest, total, readCount, unreadCount };
    });

    return NextResponse.json({ subjects: result, track });
}
