import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getApplicabilityFilter } from '@/lib/eligibility';
import { TrackScope } from '@prisma/client';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const userId = (session.user as any).id;

        const profile = await prisma.userProfile.findUnique({ where: { userId } });
        const track = profile?.activeTrack ?? 'JUIZ_ESTADUAL';
        const eligibility = getApplicabilityFilter(track as any);

        // 1. GERAL: Total vs Lidos
        const totalPrecedents = await prisma.precedent.count({ where: eligibility });
        const readData = await prisma.precedentRead.aggregate({
            where: { userId, readCount: { gt: 0 }, precedent: eligibility },
            _sum: { correctCount: true, wrongCount: true },
            _count: { _all: true }
        });

        // 2. POR TRIBUNAL
        const courtStats = await prisma.precedent.groupBy({
            where: eligibility,
            by: ['court'],
            _count: { _all: true }
        });

        const readStatsByCourt = await prisma.precedentRead.groupBy({
            where: { userId, readCount: { gt: 0 }, precedent: eligibility },
            by: ['precedentId'], // This is tricky with Prisma groupBy, let's fetch and reduce or do a raw query/multiple queries
        });
        // Simplification: We'll fetch the counts per court using separate queries as before but expanded
        const stfTotal = await prisma.precedent.count({ where: { ...eligibility, court: 'STF' } });
        const stfRead = await prisma.precedentRead.count({ where: { userId, readCount: { gt: 0 }, precedent: { ...eligibility, court: 'STF' } } });
        const stfHits = await prisma.precedentRead.aggregate({ where: { userId, precedent: { ...eligibility, court: 'STF' } }, _sum: { correctCount: true, wrongCount: true } });

        const stjTotal = await prisma.precedent.count({ where: { ...eligibility, court: 'STJ' } });
        const stjRead = await prisma.precedentRead.count({ where: { userId, readCount: { gt: 0 }, precedent: { ...eligibility, court: 'STJ' } } });
        const stjHits = await prisma.precedentRead.aggregate({ where: { userId, precedent: { ...eligibility, court: 'STJ' } }, _sum: { correctCount: true, wrongCount: true } });

        // 3. POR MATÉRIA (Subject)
        const subjects = await prisma.subject.findMany({
            where: (track === 'PROCURADOR'
                ? { OR: [{ forProcurador: true }, { trackScope: 'COMMON' as TrackScope }, { trackScope: 'PROCURADOR' as TrackScope }] }
                : track === 'JUIZ_FEDERAL'
                    ? { OR: [{ forJuizFederal: true }, { trackScope: 'COMMON' as TrackScope }, { trackScope: 'JUIZ_FEDERAL' as TrackScope }] }
                    : { OR: [{ forJuizEstadual: true }, { trackScope: 'COMMON' as TrackScope }, { trackScope: 'JUIZ_ESTADUAL' as TrackScope }] }
            ),
            include: {
                precedents: {
                    where: eligibility,
                    select: {
                        id: true,
                        reads: { where: { userId } }
                    }
                }
            }
        });

        const bySubject = subjects.map(s => {
            const total = s.precedents.length;
            const read = s.precedents.filter(p => p.reads.length > 0).length;
            const hits = s.precedents.reduce((acc, p) => acc + (p.reads[0]?.correctCount ?? 0), 0);
            const misses = s.precedents.reduce((acc, p) => acc + (p.reads[0]?.wrongCount ?? 0), 0);
            return {
                id: s.id,
                name: s.name,
                total,
                read,
                hits,
                misses,
                percent: total > 0 ? Math.round((read / total) * 100) : 0,
                hitRate: (hits + misses) > 0 ? Math.round((hits / (hits + misses)) * 100) : 0
            };
        }).filter(s => s.total > 0).sort((a, b) => b.read - a.read);

        // 4. POR ANO (Informativo ou Julgamento)
        // Since we don't have a direct Year field that is easy to groupBy without DB-specific functions, we'll fetch all reads and group in JS
        const allUserReads = await prisma.precedentRead.findMany({
            where: { userId, precedent: eligibility },
            include: {
                precedent: {
                    select: { informatoryYear: true, judgmentDate: true }
                }
            }
        });

        const yearMap: Record<string, { read: number, hits: number, misses: number }> = {};
        allUserReads.forEach(r => {
            const y = r.precedent.informatoryYear?.toString() || (r.precedent.judgmentDate ? new Date(r.precedent.judgmentDate).getFullYear().toString() : 'N/A');
            if (!yearMap[y]) yearMap[y] = { read: 0, hits: 0, misses: 0 };
            if (r.readCount > 0) yearMap[y].read++;
            yearMap[y].hits += r.correctCount;
            yearMap[y].misses += r.wrongCount;
        });

        // 5. EVENTOS (Heatmap)
        const events = allUserReads.flatMap(r => r.readEvents);

        return NextResponse.json({
            summary: {
                total: totalPrecedents,
                read: readData._count._all,
                hits: readData._sum.correctCount || 0,
                misses: readData._sum.wrongCount || 0,
                percent: totalPrecedents > 0 ? Math.round((readData._count._all / totalPrecedents) * 100) : 0
            },
            byCourt: {
                STF: { total: stfTotal, read: stfRead, hits: stfHits._sum.correctCount || 0, misses: stfHits._sum.wrongCount || 0 },
                STJ: { total: stjTotal, read: stjRead, hits: stjHits._sum.correctCount || 0, misses: stjHits._sum.wrongCount || 0 },
            },
            bySubject,
            byYear: Object.entries(yearMap).map(([year, stats]) => ({ year, ...stats })).sort((a, b) => b.year.localeCompare(a.year)),
            events
        });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
