import { prisma } from '@/lib/prisma';
import { Track } from '@prisma/client';
import { getApplicabilityFilter } from '@/lib/eligibility';

export interface GetPrecedentsOptions {
    userId: string;
    subjectId?: string | null;
    subjectIds?: string[] | null;
    q?: string | null;
    limit?: number;
}

export class PrecedentService {
    /**
     * Busca os precedentes publicados, filtrados pela Trilha do usuário,
     * e os mescla com os dados de "Lido/Favoritos/Estatísticas" próprios daquele usuário.
     */
    static async getForUser({ userId, subjectId, subjectIds, q, limit = 500 }: GetPrecedentsOptions) {
        let where: any = {
            status: 'PUBLISHED'
        };

        if (subjectId && subjectId !== 'ALL') {
            where.subjects = { some: { id: subjectId } };
        } else if (subjectIds && subjectIds.length > 0) {
            where.subjects = { some: { id: { in: subjectIds } } };
        }

        if (q) {
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { summary: { contains: q, mode: 'insensitive' } },
                { theme: { contains: q, mode: 'insensitive' } },
                { processNumber: { contains: q, mode: 'insensitive' } },
                { informatory: { number: { contains: q, mode: 'insensitive' } } }
            ];
        }

        // 1. Busca os dados de negócio (Julgados) com Join no Pai (Informativo)
        // Debug logging only in development
        if (process.env.NODE_ENV === 'development') {
            console.log('[PrecedentService] Fetching precedents for user:', userId, 'where:', JSON.stringify(where));
        }

        const precedentsDb = await prisma.precedent.findMany({
            where,
            orderBy: [{ judgmentDate: 'desc' }, { createdAt: 'desc' }],
            select: {
                id: true,
                title: true,
                summary: true,
                court: true,
                judgmentDate: true,
                publicationDate: true,
                isRG: true,
                rgTheme: true,
                informatoryNumber: true,
                informatoryYear: true,
                processClass: true,
                processNumber: true,
                organ: true,
                rapporteur: true,
                theme: true,
                tags: true,
                status: true,
                flashcardAnswer: true,
                flashcardQuestion: true,
                // fullTextOrLink is excluded for performance and fetched on demand
                subjects: {
                    select: { id: true, name: true }
                },
                informatory: { select: { court: true, number: true, year: true } }
            },
            take: limit,
        });

        if (process.env.NODE_ENV === 'development') {
            console.log('[PrecedentService] Found precedents:', precedentsDb.length);
        }

        // Se precisarmos fazer "tree-shake" dos dados sensíveis, faríamos aqui.
        // No momento a estrutura já atende.

        // 2. Busca o Histórico Pessoal do Aluno
        const readsList = await prisma.precedentRead.findMany({
            where: { userId, precedentId: { in: precedentsDb.map(p => p.id) } } // Otimização: Só busca do que foi retornado!
        });
        const readMap = new Map<string, any>(readsList.map((r: any) => [r.precedentId, r]));

        // 3. Mescla o Público com o Privado (Hydration)
        try {
            return precedentsDb.map((p: any) => {
                const r = readMap.get(p.id);

                // Retro-compatibilidade (Flat Map para a Interface legada do Dashboard)
                const mappedP = {
                    ...p,
                    court: p.informatory?.court || p.court,
                    informatoryNumber: p.informatory?.number || null,
                    informatoryYear: p.informatory?.year || null,
                };

                return {
                    ...mappedP,
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
        } catch (mergeError: any) {
            console.error('[PrecedentService] Error merging data:', mergeError);
            throw new Error(`Erro ao processar dados dos julgados localmente: ${mergeError.message}`);
        }
    }
}
