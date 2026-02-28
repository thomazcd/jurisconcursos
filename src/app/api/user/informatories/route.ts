import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        // Busca os informativos únicos no banco
        const informatories = await prisma.precedent.findMany({
            where: {
                informatoryNumber: { not: null }
            },
            select: {
                court: true,
                informatoryNumber: true,
                informatoryYear: true,
                updatedAt: true,
            },
            orderBy: [
                { informatoryYear: 'desc' },
                { informatoryNumber: 'desc' }
            ]
        });

        // Agrupa por Tribunal e Número/Ano
        const map = new Map<string, { court: string, number: string, year: number | null, lastUpdate: Date }>();
        let globalLastUpdate = new Date(0);

        informatories.forEach(inf => {
            const key = `${inf.court}-${inf.informatoryNumber}-${inf.informatoryYear}`;
            if (inf.updatedAt > globalLastUpdate) globalLastUpdate = inf.updatedAt;

            if (!map.has(key)) {
                map.set(key, {
                    court: inf.court,
                    number: inf.informatoryNumber!,
                    year: inf.informatoryYear,
                    lastUpdate: inf.updatedAt
                });
            } else {
                const existing = map.get(key)!;
                if (inf.updatedAt > existing.lastUpdate) {
                    existing.lastUpdate = inf.updatedAt;
                }
            }
        });

        const list = Array.from(map.values()).sort((a, b) => {
            if (b.year !== a.year) return (b.year || 0) - (a.year || 0);
            return parseInt(b.number) - parseInt(a.number);
        });

        return NextResponse.json({
            informatories: list,
            lastUpdate: globalLastUpdate
        });
    } catch (error) {
        console.error('Erro ao buscar novidades:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
