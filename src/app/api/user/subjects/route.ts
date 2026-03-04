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

        const userId = session!.user.id;

        // Optimized query to get counts directly from the DB
        const subjects: any[] = await prisma.$queryRaw`
            SELECT 
                s.id, 
                s.name,
                COUNT(p.id)::int as total,
                COUNT(pr."readCount") FILTER (WHERE pr."readCount" > 0)::int as "readCount"
            FROM subjects s
            LEFT JOIN "_PrecedentToSubject" pts ON pts."B" = s.id
            LEFT JOIN precedents p ON p.id = pts."A" AND p.status = 'PUBLISHED'
            LEFT JOIN precedent_reads pr ON pr."precedentId" = p.id AND pr."userId" = ${userId}
            GROUP BY s.id, s.name
            ORDER BY s.name ASC
        `;

        const result = subjects.map(s => ({
            id: s.id,
            name: s.name,
            total: s.total || 0,
            readCount: s.readCount || 0,
            unreadCount: Math.max(0, (s.total || 0) - (s.readCount || 0))
        }));

        // Optionally filter out subjects with 0 precedents to keep it clean, 
        // but for now return all as the user wants to see everything.
        return NextResponse.json({ subjects: result, hasSelection: false });
    } catch (err: any) {
        console.error('ERROR in GET /api/user/subjects:', err);
        return NextResponse.json({ error: 'Erro ao carregar matérias', details: err.message }, { status: 500 });
    }
}
