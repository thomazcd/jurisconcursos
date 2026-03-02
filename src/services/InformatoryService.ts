import { prisma } from '@/lib/prisma';
import { Track } from '@prisma/client';

export class InformatoryService {
    /**
     * Busca informativos publicados que possuem teses para a trilha do usuário.
     */
    static async getPublishedForTrack(track: Track) {
        return await prisma.informatory.findMany({
            where: {
                status: 'PUBLISHED',
                precedents: {
                    some: {
                        status: 'PUBLISHED',
                        OR: [
                            { forAll: true },
                            ...(track === 'JUIZ_ESTADUAL' ? [{ forJuizEstadual: true }] : []),
                            ...(track === 'JUIZ_FEDERAL' ? [{ forJuizFederal: true }] : []),
                            ...(track === 'PROCURADOR' ? [{ forProcurador: true }] : []),
                        ],
                    },
                },
            },
            select: {
                id: true,
                court: true,
                number: true,
                year: true,
            },
            orderBy: [
                { year: 'desc' },
                { number: 'desc' },
            ],
        });
    }

    /**
     * Busca o último informativo publicado no banco geral.
     */
    static async getLatestGeneric() {
        return await prisma.informatory.findFirst({
            where: { status: 'PUBLISHED' },
            orderBy: [{ year: 'desc' }, { number: 'desc' }],
        });
    }

    /**
     * Formata o nome do informativo para exibição na UI (Ex: STJ 875/2026)
     */
    static formatName(court: string, number: string, year: number | null) {
        return `${court} ${number}${year ? `/${year}` : ''}`;
    }
}
