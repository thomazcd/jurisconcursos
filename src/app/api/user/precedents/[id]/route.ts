import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/guards';
import { prisma } from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    noStore();
    try {
        const { error, session } = await requireAuth(['USER', 'ADMIN', 'GESTOR']);
        if (error) return error;

        const userId = (session!.user as any).id;
        const id = params.id;

        const precedent = await prisma.precedent.findUnique({
            where: { id },
            include: {
                subjects: { select: { id: true, name: true } },
                informatory: { select: { court: true, number: true, year: true } },
                reads: {
                    where: { userId },
                    take: 1
                }
            }
        });

        if (!precedent) {
            return NextResponse.json({ error: 'Precedente não encontrado' }, { status: 404 });
        }

        // Return the full details including fullTextOrLink
        return NextResponse.json({
            ...precedent,
            readCount: precedent.reads[0]?.readCount ?? 0,
            isFavorite: precedent.reads[0]?.isFavorite ?? false,
            notes: precedent.reads[0]?.notes ?? null,
        });
    } catch (err: any) {
        console.error('ERROR in GET /api/user/precedents/[id]:', err);
        return NextResponse.json({ error: 'Erro ao buscar detalhes do julgado' }, { status: 500 });
    }
}
