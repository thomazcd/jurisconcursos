import { prisma } from '../../src/lib/prisma';

async function deduplicate() {
    const precedents = await prisma.precedent.findMany({
        where: { informatoryNumber: '875' }
    });

    console.log(`Checking ${precedents.length} precedents for Inf 875...`);

    const seen = new Set<string>();
    const toDelete: string[] = [];

    for (const p of precedents) {
        // Normalize identifying fields
        const normalizedProcess = p.processNumber?.replace(/\s+/g, '') || 'NONE';
        const normalizedTheme = p.theme?.trim() || 'NONE_THEME';

        // Use theme as primary key for duplication detection as it's the most descriptive
        const key = `${p.informatoryNumber}_${normalizedTheme}`;

        if (seen.has(key)) {
            toDelete.push(p.id);
        } else {
            seen.add(key);
        }
    }

    if (toDelete.length > 0) {
        console.log(`Deleting ${toDelete.length} duplicates...`);
        await prisma.precedent.deleteMany({
            where: { id: { in: toDelete } }
        });
        console.log('Done.');
    } else {
        console.log('No duplicates found.');
    }
}

deduplicate()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
