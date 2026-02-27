import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/guards';
import { getEligibleApplicabilities } from '@/lib/eligibility';
import { Track } from '@prisma/client';

// GET /api/user/precedents?subjectId=&court=&q=&page=&limit=&unreadOnly=
export async function GET(req: NextRequest) {
    const { error, session } = await requireAuth(['USER', 'ADMIN', 'GESTOR']);
    if (error) return error;

    const userId = (session!.user as any).id as string;
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    const track: Track = (profile?.activeTrack ?? 'JUIZ') as Track;
    const apps = getEligibleApplicabilities(track);

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');
    const court = searchParams.get('court');
    const q = searchParams.get('q');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '15'));
    const skip = (page - 1) * limit;

    const where: any = {
        applicability: { in: apps },
    };
    if (subjectId) where.subjectId = subjectId;
    if (court) where.court = court;
    if (q) {
        where.OR = [
            { title: { contains: q, mode: 'insensitive' } },
            { summary: { contains: q, mode: 'insensitive' } },
            { tags: { has: q.toLowerCase() } },
        ];
    }

    let [total, precedents] = await prisma.$transaction([
        prisma.precedent.count({ where }),
        prisma.precedent.findMany({
            where,
            include: {
                subject: { select: { id: true, name: true } },
                reads: { where: { userId }, select: { readAt: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
    ]);

    const enriched = precedents.map((p) => ({
        ...p,
        isRead: p.reads.length > 0,
        readAt: p.reads[0]?.readAt ?? null,
        reads: undefined,
    }));

    const filtered = unreadOnly ? enriched.filter((p) => !p.isRead) : enriched;

    return NextResponse.json({
        precedents: filtered,
        total: unreadOnly ? filtered.length : total,
        page,
        limit,
        track,
    });
}
