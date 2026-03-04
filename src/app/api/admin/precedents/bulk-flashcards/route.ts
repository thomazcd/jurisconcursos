import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/guards';
import { AIService } from '@/services/AIService';

/**
 * Rota para gerar flashcards de IA para múltiplos precedentes filtrados.
 */
export async function POST(req: NextRequest) {
    const { error } = await requireAuth(['ADMIN', 'GESTOR']);
    if (error) return error;

    try {
        const body = await req.json();
        const { precedentIds } = body;

        if (!precedentIds || !Array.isArray(precedentIds) || precedentIds.length === 0) {
            return NextResponse.json({ error: 'Nenhum Precedente selecionado.' }, { status: 400 });
        }

        const precedents = await prisma.precedent.findMany({
            where: { id: { in: precedentIds } },
            select: { id: true, summary: true }
        });

        const updatedCount = 0;
        const results = [];

        // Por segurança, vamos limitar a 20 por vez para evitar timeout no Vercel (max 60s)
        const batch = precedents.slice(0, 20);

        for (const p of batch) {
            try {
                const { question, answer } = await AIService.generateFlashcard(p.summary);

                await prisma.precedent.update({
                    where: { id: p.id },
                    data: {
                        flashcardQuestion: question,
                        flashcardAnswer: answer
                    }
                });
                results.push({ id: p.id, status: 'ok' });
            } catch (err: any) {
                console.error(`Erro ao atualizar flashcard id ${p.id}:`, err);
                results.push({ id: p.id, status: 'error', message: err.message });
            }
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            totalRequested: precedentIds.length,
            results
        });
    } catch (err: any) {
        console.error('ERROR in /api/admin/precedents/bulk-flashcards:', err);
        return NextResponse.json({ error: 'Erro ao gerar flashcards', details: err.message }, { status: 500 });
    }
}
