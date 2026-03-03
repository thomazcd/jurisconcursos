import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const precedents = await prisma.precedent.findMany({
        take: 3,
        where: {
            AND: [
                { fullTextOrLink: { not: null } },
                { fullTextOrLink: { not: { startsWith: 'http' } } }
            ]
        },
        select: {
            id: true,
            title: true,
            fullTextOrLink: true
        }
    });

    console.log(JSON.stringify(precedents, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
