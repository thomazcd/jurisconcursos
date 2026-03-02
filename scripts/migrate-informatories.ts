import { PrismaClient, Court } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Iniciando migração de dados para a nova estrutura de Informativos...');

    // Busca todos os precedentes que ainda não têm um informatoryId,
    // mas que possuem informatoryNumber.
    const precedents = await prisma.precedent.findMany({
        where: {
            informatoryId: null,
            informatoryNumber: { not: null },
        },
        select: {
            id: true,
            court: true,
            informatoryNumber: true,
            informatoryYear: true,
            publicationDate: true,
        },
    });

    console.log(`Encontrados ${precedents.length} precedentes para parear com informativos.`);

    // Agrupa para encontrar informativos únicos
    const informatoryMap = new Map<string, { court: Court; number: string; year: number | null; publicationDate: Date | null }>();

    for (const p of precedents) {
        if (!p.informatoryNumber) continue;
        const key = `${p.court}-${p.informatoryNumber}`;
        if (!informatoryMap.has(key)) {
            informatoryMap.set(key, {
                court: p.court,
                number: p.informatoryNumber,
                year: p.informatoryYear,
                publicationDate: p.publicationDate,
            });
        }
    }

    console.log(`Identificados ${informatoryMap.size} informativos únicos.`);

    let createdCount = 0;
    let mappedCount = 0;

    for (const [key, data] of Array.from(informatoryMap.entries())) {
        // Usa upsert para criar ou encontrar o informativo
        const informatory = await prisma.informatory.upsert({
            where: {
                court_number: { court: data.court, number: data.number },
            },
            update: {},
            create: {
                court: data.court,
                number: data.number,
                year: data.year,
                publicationDate: data.publicationDate,
                status: 'PUBLISHED', // Todo o legado deve estar publicado
            },
        });
        createdCount++;

        // Atualiza todos os precedentes deste informativo
        const updateResult = await prisma.precedent.updateMany({
            where: {
                informatoryId: null,
                court: data.court,
                informatoryNumber: data.number,
            },
            data: {
                informatoryId: informatory.id,
                status: 'PUBLISHED',
            },
        });
        mappedCount += updateResult.count;
    }

    console.log(`✅ Migração concluída: ${createdCount} informativos processados, ${mappedCount} precedentes atualizados.`);
}

main()
    .catch((e) => {
        console.error('Erro na migração:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
