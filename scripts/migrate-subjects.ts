import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Inicando migração de matérias para relação Many-to-Many ---');

    // 1. Get all precedents that have a subjectId but no subjects (relation)
    // Note: Since subjectId is still in the schema temporarily, we can use it.
    const precedents = await prisma.precedent.findMany({
        where: {
            subjectId: { not: null },
            subjects: { none: {} }
        }
    });

    console.log(`Encontrados ${precedents.length} precedentes para atualizar.`);

    for (const p of precedents) {
        if (p.subjectId) {
            await prisma.precedent.update({
                where: { id: p.id },
                data: {
                    subjects: {
                        connect: [{ id: p.subjectId }]
                    }
                }
            });
        }
    }

    console.log('--- Migração concluída com sucesso! ---');
}

main()
    .catch((e) => {
        console.error('Erro na migração:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
