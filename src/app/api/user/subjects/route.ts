import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/guards';
import { getSubjectFilter, getApplicabilityFilter } from '@/lib/eligibility';
import { Track } from '@prisma/client';
import { unstable_noStore as noStore } from 'next/cache';

export async function GET(req: NextRequest) {
    noStore();
    try {
        const { error, session } = await requireAuth(['USER', 'ADMIN', 'GESTOR']);
        if (error) return error;

        const userId = (session!.user as any).id as string;

        // Fetch subjects and their PUBLISHED precedents
        const subjects = await prisma.subject.findMany({
            orderBy: { name: 'asc' },
            include: {
                precedents: {
                    where: { status: 'PUBLISHED' },
                    select: {
                        id: true,
                        reads: { where: { userId }, select: { userId: true } },
                    }
                }
            },
        });

        const result = subjects.map((s: any) => {
            const total = s.precedents.length;
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

        // Optionally filter out subjects with 0 precedents to keep it clean, 
        // but for now return all as the user wants to see everything.
        return NextResponse.json({ subjects: result, hasSelection: false });
    } catch (err: any) {
        console.error('ERROR in GET /api/user/subjects:', err);
        return NextResponse.json({ error: 'Erro ao carregar matérias', details: err.message }, { status: 500 });
    }
}
