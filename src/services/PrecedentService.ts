import { prisma } from '@/lib/prisma';
import { Track } from '@prisma/client';
import { getApplicabilityFilter } from '@/lib/eligibility';

export interface GetPrecedentsOptions {
    track: Track;
    userId: string;
    subjectId?: string | null;
    q?: string | null;
    selectedSubjectIds?: string[];
    limit?: number;
}

export class PrecedentService {
    /**
     * Busca os precedentes publicados, filtrados pela Trilha do usuário,
     * e os mescla com os dados de "Lido/Favoritos/Estatísticas" próprios daquele usuário.
     */
    static async getForUser({ track, userId, subjectId, q, selectedSubjectIds = [], limit = 500 }: GetPrecedentsOptions) {
        // Se houver seleção manual de matérias, ignoramos o filtro de carreira para dar liberdade total.
        // Exceto se a trilha for 'TODAS', o appFilter já é vazio.
        const appFilter = selectedSubjectIds.length > 0 ? {} : getApplicabilityFilter(track);

        let where: any = {
            status: 'PUBLISHED',
            ...appFilter
        };

        if (subjectId && subjectId !== 'ALL') {
            where.subjects = { some: { id: subjectId } };
        } else if (selectedSubjectIds.length > 0) {
            // Optimization for Postgres: only use the IN clause if not all subjects are selected
            // But since we don't know total, we just apply it.
            where.subjects = { some: { id: { in: selectedSubjectIds } } };
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
        const precedentsDb = await prisma.precedent.findMany({
            where,
            orderBy: [{ judgmentDate: 'desc' }, { createdAt: 'desc' }],
            include: {
                subjects: {
                    select: { id: true, name: true },
                    // If the user selected subjects, only return those ones in the relation so we dont send a massive payload
                    where: selectedSubjectIds.length > 0 ? { id: { in: selectedSubjectIds } } : undefined
                },
                informatory: { select: { court: true, number: true, year: true } }
            },
            take: limit, // removed distinct as it may force a heavy DISTINCT ON
        });

        // Se precisarmos fazer "tree-shake" dos dados sensíveis, faríamos aqui.
        // No momento a estrutura já atende.

        // 2. Busca o Histórico Pessoal do Aluno
        const readsList = await prisma.precedentRead.findMany({
            where: { userId, precedentId: { in: precedentsDb.map(p => p.id) } } // Otimização: Só busca do que foi retornado!
        });
        const readMap = new Map<string, any>(readsList.map((r: any) => [r.precedentId, r]));

        // 3. Mescla o Público com o Privado (Hydration)
        return precedentsDb.map((p: any) => {
            const r = readMap.get(p.id);

            // Retro-compatibilidade (Flat Map para a Interface legada do Dashboard)
            // Futuramente mudaremos o React para ler p.informatory.number direto
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
    }
}
