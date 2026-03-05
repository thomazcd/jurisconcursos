import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/guards';

export async function GET() {
    const { session, error } = await requireAuth(['USER', 'ADMIN', 'GESTOR']);
    if (error) return error;

    try {
        const reads = await prisma.precedentRead.findMany({
            where: {
                userId: session.user.id,
                readCount: { gt: 0 }
            },
            include: {
                precedent: {
                    select: { tags: true }
                }
            }
        });

        const tagCounts: Record<string, number> = {};
        reads.forEach(r => {
            r.precedent.tags.forEach(tag => {
                const normalized = tag.trim();
                if (normalized) {
                    tagCounts[normalized] = (tagCounts[normalized] || 0) + 1;
                }
            });
        });

        const data = Object.entries(tagCounts)
            .map(([subject, count]) => ({
                subject,
                A: count,
                fullMark: Math.max(...Object.values(tagCounts), 10)
            }))
            .sort((a, b) => b.A - a.A);

        return NextResponse.json(data);
    } catch (err: any) {
        console.error('Radar endpoint error:', err);
        return NextResponse.json({ error: 'Falha ao carregar radar.' }, { status: 500 });
    }
}
