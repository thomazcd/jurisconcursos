import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const total = await prisma.precedent.count();
    const withNewlines = await prisma.precedent.count({
        where: {
            fullTextOrLink: {
                contains: '\n'
            }
        }
    });

    console.log(`Total precedents: ${total}`);
    console.log(`Precedents with newlines: ${withNewlines}`);

    if (withNewlines > 0) {
        const sample = await prisma.precedent.findFirst({
            where: {
                fullTextOrLink: {
                    contains: '\n'
                }
            },
            select: { fullTextOrLink: true }
        });
        console.log("Sample with newlines (first 200 chars):");
        console.log(sample?.fullTextOrLink?.substring(0, 200));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
