import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/guards';
import { InformatoryService } from '@/services/InformatoryService';
import { Track } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
    const { error, session } = await requireAuth(['USER', 'ADMIN', 'GESTOR']);
    if (error) return error;

    const activeTrack = (session.user as any).activeTrack as Track;

    try {
        // Usa o serviço centralizado para buscar apenas os informativos da trilha do aluno
        const informatoriesDb = await InformatoryService.getPublishedForTrack(activeTrack);

        // O front-end ainda espera o formato: { court: string, number: string, year: number | null }
        // Para compatibilidade, traduziremos rápido
        const list = informatoriesDb.map(inf => ({
            court: inf.court,
            number: inf.number,
            year: inf.year,
        }));

        // Adiciona um lastUpdate global (pega o registro mais recente em Precedentes gerais pra trigger de notificação, se existir)
        const lastPrecedent = await prisma.precedent.findFirst({
            where: { status: 'PUBLISHED' },
            orderBy: { updatedAt: 'desc' },
            select: { updatedAt: true }
        });

        return NextResponse.json({
            informatories: list,
            lastUpdate: lastPrecedent?.updatedAt || new Date(0)
        });
    } catch (error) {
        console.error('Erro ao buscar novidades:', error);
        return NextResponse.json({ error: 'Erro interno no Serviço de Informativos' }, { status: 500 });
    }
}
