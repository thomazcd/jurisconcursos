import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function formatFullText(text: string): string {
    if (!text || text.startsWith('http')) return text;

    // 1. LIMPEZA: Remover rodapés de informativos
    let cleaned = text.replace(/Informativo de Jurisprudência n?\.? \d+.*?\d{4}\.?/gi, '').trim();
    cleaned = cleaned.replace(/Informativo de Jurisprudência$/gi, '').trim();

    // 2. PARÁGRAFOS: Inserir \n\n antes de termos de transição jurídica
    const transitionWords = [
        'Nos termos do', 'Nos termos do', 'De fato,', 'Contudo,', 'Ademais,',
        'Não há dúvidas, portanto,', 'Assim,', 'Nesse sentido,', 'Note-se que',
        'Por fim,', 'Cinge-se a', 'Com efeito,', 'Desse modo,', 'Portanto,',
        'Ocorre que', 'E registrou que', 'Dessa senda,', 'Evoluindo em tal',
        'Adensando ainda mais', 'Sucede que', 'No caso,', 'De início,', 'Destarte,'
    ];

    transitionWords.forEach(word => {
        const regex = new RegExp(`(?<!^)(?<!\\n\\n)\\s(${word})`, 'g');
        cleaned = cleaned.replace(regex, '\n\n$1');
    });

    // 3. CITAÇÕES: Isolar aspas longas
    const introPhrases = [': "', 'seguinte: "', 'dispõe que "', 'concluiu que "', 'fixou que: "'];

    introPhrases.forEach(phrase => {
        if (cleaned.includes(phrase)) {
            const parts = cleaned.split(phrase);
            let newContent = parts[0] + phrase.replace(' "', ':\n\n"');
            for (let i = 1; i < parts.length; i++) {
                if (parts[i].includes('."')) {
                    const quoteParts = parts[i].split('."');
                    if (quoteParts[0].length > 40) {
                        newContent += quoteParts[0] + '."\n\n' + quoteParts.slice(1).join('."');
                    } else {
                        newContent += parts[i];
                    }
                } else {
                    newContent += parts[i];
                }
            }
            cleaned = newContent;
        }
    });

    return cleaned.replace(/\n{3,}/g, '\n\n').trim();
}

async function main() {
    const precedents = await prisma.precedent.findMany({
        where: {
            AND: [
                { fullTextOrLink: { not: null } },
                { fullTextOrLink: { not: { startsWith: 'http' } } }
            ]
        }
    });

    console.log(`Starting format update for ${precedents.length} precedents...`);

    for (const p of precedents) {
        const formatted = formatFullText(p.fullTextOrLink!);
        if (formatted !== p.fullTextOrLink) {
            await prisma.precedent.update({
                where: { id: p.id },
                data: { fullTextOrLink: formatted }
            });
            console.log(`✅ Updated: ${p.title.substring(0, 40)}...`);
        } else {
            console.log(`⚪ No changes needed: ${p.title.substring(0, 40)}...`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
