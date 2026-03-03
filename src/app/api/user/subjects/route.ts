import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/guards';
import { getSubjectFilter, getApplicabilityFilter } from '@/lib/eligibility';
import { Track } from '@prisma/client';
import { unstable_noStore as noStore } from 'next/cache';

// GET /api/user/subjects – list subjects for user's active track + unread counts
export async function GET(req: NextRequest) {
    noStore();
    try {
        const { error, session } = await requireAuth(['USER', 'ADMIN', 'GESTOR']);
        if (error) return error;

        const userId = (session!.user as any).id as string;
        const profile = await prisma.userProfile.findUnique({
            where: { userId },
            include: { selectedSubjects: { select: { id: true } } }
        });

        const appFilter = { status: 'PUBLISHED' as const };
        const subjects = await prisma.subject.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { precedents: { where: appFilter } }
                },
                precedents: {
                    where: appFilter,
                    select: {
                        id: true,
                        reads: { where: { userId }, select: { userId: true } },
                    }
                }
            },
        });

        const result = subjects.map((s: any) => {
            const total = s._count.precedents;
            const readCount = s.precedents.filter((p: any) => p.reads.length > 0).length;
            const unreadCount = total - readCount;

            return {
                id: s.id,
                name: s.name,
                total,
                readCount,
                unreadCount
            };
        });

        return NextResponse.json({ subjects: result, hasSelection: false });
    } catch (err: any) {
        console.error('ERROR in GET /api/user/subjects:', err);
        return NextResponse.json({ error: 'Erro ao carregar matérias', details: err.message }, { status: 500 });
    }
}
