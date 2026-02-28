import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getApplicabilityFilter } from '@/lib/eligibility';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userId = (session.user as any).id;
        console.log(`[Precedents API] User ID: ${userId}`);

        const { searchParams } = new URL(req.url);
        const subjectId = searchParams.get('subjectId');

        // Step 1: Count total to verify DB access
        const total = await prisma.precedent.count();
        console.log(`[Precedents API] Total Precedents in DB: ${total}`);

        // Step 2: Fetch minimal data
        const where: any = {};
        if (subjectId && subjectId !== 'ALL') {
            where.subjectId = subjectId;
        }

        const precedents = await prisma.precedent.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 200,
        });
        console.log(`[Precedents API] Fetched ${precedents.length} precedents`);

        // Step 3: Fetch reads separately to avoid complex includes if they are breaking
        const reads = await prisma.precedentRead.findMany({
            where: { userId }
        });
        const readMap = new Map<string, any>(reads.map((r: any) => [r.precedentId, r]));

        const result = precedents.map((p: any) => {
            const r = readMap.get(p.id);
            return {
                ...p,
                readCount: r?.readCount ?? 0,
                isRead: (r?.readCount ?? 0) > 0,
                readEvents: r?.readEvents ?? [],
                correctCount: r?.correctCount ?? 0,
                wrongCount: r?.wrongCount ?? 0,
                lastResult: r?.lastResult ?? null,
                isFavorite: r?.isFavorite ?? false,
                notes: r?.notes ?? null,
            };
        });

        return NextResponse.json({ precedents: result });
    } catch (err: any) {
        console.error('FATAL ERROR in GET /api/user/precedents:', err);
        return NextResponse.json({
            error: err.message,
            stack: err.stack,
            phase: 'execution'
        }, { status: 500 });
    }
}
