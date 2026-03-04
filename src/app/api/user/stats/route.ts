import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/guards';
import { prisma } from '@/lib/prisma';
import { getApplicabilityFilter } from '@/lib/eligibility';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { error, session } = await requireAuth(['USER', 'ADMIN', 'GESTOR']);
        if (error) return error;
        const userId = session!.user.id;

        const eligibility = getApplicabilityFilter();

        // Run both queries in parallel for better performance
        const [allPrecedents, allUserReads] = await Promise.all([
            prisma.precedent.findMany({
                where: { ...eligibility },
                select: { id: true, court: true, informatoryYear: true, judgmentDate: true, subjects: { select: { id: true, name: true } } }
            }),
            prisma.precedentRead.findMany({
                where: { userId },
                select: { precedentId: true, readCount: true, correctCount: true, wrongCount: true, readEvents: true }
            })
        ]);

        // 2. Mapeamento de memória super rápido O(N)
        const readMap = new Map();
        for (const r of allUserReads) readMap.set(r.precedentId, r);

        let totalReads = 0, totalHits = 0, totalMisses = 0;
        let stfTotal = 0, stfRead = 0, stfHits = 0, stfMisses = 0;
        let stjTotal = 0, stjRead = 0, stjHits = 0, stjMisses = 0;

        const subjectMap: Record<string, { name: string, total: number, read: number, hits: number, misses: number }> = {};
        const yearMap: Record<string, { read: number, hits: number, misses: number }> = {};
        const events: Date[] = [];

        for (const p of allPrecedents) {
            const isStf = p.court === 'STF';
            const isStj = p.court === 'STJ';

            if (isStf) stfTotal++;
            if (isStj) stjTotal++;

            for (const sub of p.subjects) {
                if (!subjectMap[sub.id]) subjectMap[sub.id] = { name: sub.name, total: 0, read: 0, hits: 0, misses: 0 };
                subjectMap[sub.id].total++;
            }

            const r = readMap.get(p.id);
            if (r) {
                const hasRead = r.readCount > 0;
                if (hasRead) {
                    totalReads++;
                    if (isStf) stfRead++;
                    if (isStj) stjRead++;
                }

                totalHits += r.correctCount;
                totalMisses += r.wrongCount;

                if (isStf) { stfHits += r.correctCount; stfMisses += r.wrongCount; }
                if (isStj) { stjHits += r.correctCount; stjMisses += r.wrongCount; }

                for (const sub of p.subjects) {
                    if (hasRead) subjectMap[sub.id].read++;
                    subjectMap[sub.id].hits += r.correctCount;
                    subjectMap[sub.id].misses += r.wrongCount;
                }

                const y = p.informatoryYear?.toString() || (p.judgmentDate ? new Date(p.judgmentDate).getFullYear().toString() : 'N/A');
                if (!yearMap[y]) yearMap[y] = { read: 0, hits: 0, misses: 0 };
                if (hasRead) yearMap[y].read++;
                yearMap[y].hits += r.correctCount;
                yearMap[y].misses += r.wrongCount;

                // Limit events to last 200 for performance
                if (events.length < 200) {
                    events.push(...r.readEvents.slice(-5));
                }
            }
        }

        const bySubject = Object.entries(subjectMap).map(([id, s]) => ({
            id,
            name: s.name,
            total: s.total,
            read: s.read,
            hits: s.hits,
            misses: s.misses,
            percent: s.total > 0 ? Math.round((s.read / s.total) * 100) : 0,
            hitRate: (s.hits + s.misses) > 0 ? Math.round((s.hits / (s.hits + s.misses)) * 100) : 0
        })).filter(s => s.total > 0).sort((a, b) => b.read - a.read);

        const totalPrecedents = allPrecedents.length;

        return NextResponse.json({
            summary: {
                total: totalPrecedents,
                read: totalReads,
                hits: totalHits,
                misses: totalMisses,
                percent: totalPrecedents > 0 ? Math.round((totalReads / totalPrecedents) * 100) : 0
            },
            byCourt: {
                STF: { total: stfTotal, read: stfRead, hits: stfHits, misses: stfMisses },
                STJ: { total: stjTotal, read: stjRead, hits: stjHits, misses: stjMisses },
            },
            bySubject,
            events,
            byYear: Object.entries(yearMap).map(([year, stats]) => ({ year, ...stats })).sort((a, b) => b.year.localeCompare(a.year)),
        });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
