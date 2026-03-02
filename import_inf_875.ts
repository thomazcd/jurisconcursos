import { prisma } from './src/lib/prisma';
import * as fs from 'fs';

const SUBJECT_MAPPING: Record<string, string> = {
    'DIREITO PROCESSUAL CIVIL': 's-cproc',
    'DIREITO TRIBUTÁRIO': 's-trib',
    'DIREITO PENAL': 's-pen',
    'DIREITO PROCESSUAL PENAL': 's-pproc',
    'DIREITO CONSTITUCIONAL': 's-const',
    'DIREITO CIVIL': 's-civil',
    'DIREITO INTERNACIONAL': 's-intl',
    'DIREITO ADMINISTRATIVO': 's-admin',
    'DIREITO DO CONSUMIDOR': 's-cons',
    'DIREITOS HUMANOS': 's-hum',
    'EXECUÇÃO PENAL': 's-pen',
    'DIREITO AMBIENTAL': 's-ambi',
    'ESTATUTO DA CRIANÇA E DO ADOLESCENTE': 's-civil',
};

async function main() {
    const raw = fs.readFileSync('/Users/thomazdrumond/Downloads/Thomaz/juris-concursos/inf875_raw.txt', 'utf8');

    // Split by PROCESSO, keeping the "PROCESSO" keyword. Support variations.
    const blocks = raw.split(/(?=\n\s*PROCESSO |^\s*PROCESSO )/);

    console.log(`Found ${blocks.length} blocks candidate.`);

    for (let block of blocks) {
        if (!block.trim().startsWith('PROCESSO ')) continue;

        // Extract Process Info
        const processMatch = block.match(/PROCESSO\s+([\s\S]+?)\n/);
        const processLine = processMatch ? processMatch[1].trim() : '';
        if (!processLine) continue;

        // Extract Process Details
        const processParts = processLine.split(',');
        const fullProcess = processParts[0].trim();
        const rapporteur = processParts[1]?.replace(/Rel\. Ministr[oa]/, '').replace(/Rel\. p\/ acórdão Ministr[oa]/, '').trim() || '';
        const organ = processParts[2]?.trim() || '';

        // Extract Tema Number if present in process line like "(Tema 1317)"
        const themeMatch = processLine.match(/\(Tema\s+(\d+)\)/);
        const themeNumber = themeMatch ? `Tema ${themeMatch[1]}` : null;

        // Extract Ramo do Direito
        const ramoMatch = block.match(/RAMO DO DIREITO\s+([\s\S]+?)\n\s*(TEMA|DESTAQUE)/);
        const ramosStr = ramoMatch ? ramoMatch[1].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() : '';
        const subjectIds = new Set<string>();
        for (const [key, id] of Object.entries(SUBJECT_MAPPING)) {
            if (ramosStr.includes(key)) subjectIds.add(id);
        }

        // Extract Tema-Assunto
        const temaAssuntoMatch = block.match(/TEMA\s+([\s\S]+?)\n\s*DESTAQUE/);
        let temaAssunto = temaAssuntoMatch ? temaAssuntoMatch[1].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() : '';

        // Extract Destaque
        const destaqueMatch = block.match(/DESTAQUE\s+([\s\S]+?)\n\s*(INFORMAÇÕES DO INTEIRO TEOR|INFORMAÇÕES ADICIONAIS|ÁUDIO DO TEXTO|PRECEDENTES QUALIFICADOS|LEGISLAÇÃO)/s);
        const destaque = destaqueMatch ? destaqueMatch[1].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() : '';

        // Extract Inteiro Teor
        const teorMatch = block.match(/INFORMAÇÕES DO INTEIRO TEOR\s+([\s\S]+?)\n\s*(INFORMAÇÕES ADICIONAIS|ÁUDIO DO TEXTO|PROCESSO|PRECEDENTES QUALIFICADOS|LEGISLAÇÃO)/s);
        let inteiroTeor = teorMatch ? teorMatch[1].trim() : '';
        inteiroTeor = inteiroTeor.replace(/Informativo de Jurisprudência n\. 875\s+3 de fevereiro de 2026\.\s+processo\.stj\.jus.br\/jurisprudencia\/externo\/informativo\/ \d+\/47/g, '');
        inteiroTeor = inteiroTeor.replace(/\s+/g, ' ').trim();

        // Build theme field with Pipe Trick
        const finalThemePrefix = themeNumber ? themeNumber : '';
        const finalTheme = finalThemePrefix ? `${finalThemePrefix} | ${temaAssunto}` : temaAssunto;

        // Objective Title
        let title = temaAssunto.split('.')[0].trim();
        if (title.length > 120) title = title.substring(0, 117) + '...';
        if (themeNumber && !title.includes(themeNumber)) title += ` ${themeNumber}`;

        // Extract process class and number
        // Improved class extraction to handle "ProAfR no REsp"
        let processClass = '';
        let processNumber = '';
        if (fullProcess.startsWith('Processo em segredo')) {
            processClass = 'Segredo';
            processNumber = '';
        } else {
            const m = fullProcess.match(/^([A-Za-z]+(?:\s+no\s+[A-Za-z]+)?)\s+(.+)$/);
            if (m) {
                processClass = m[1].trim();
                processNumber = m[2].trim();
            } else {
                processClass = fullProcess;
            }
        }

        // Skip detection
        const whereClause: any = { informatoryNumber: '875' };
        if (processNumber) {
            whereClause.processNumber = processNumber;
        } else {
            whereClause.summary = destaque;
        }

        const existing = await prisma.precedent.findFirst({
            where: whereClause
        });

        if (existing) {
            console.log(`Skipping already imported/duplicate: ${fullProcess}`);
            continue;
        }

        if (processClass.includes('ProAfR')) {
            console.log(`Skipping Afetação (ProAfR): ${fullProcess}`);
            continue;
        }

        if (subjectIds.size === 0) {
            console.log(`Warning: No mapping for Ramos [${ramosStr}] in ${fullProcess}. Skipping.`);
            continue;
        }

        await prisma.precedent.create({
            data: {
                title: title,
                court: 'STJ',
                informatoryNumber: '875',
                informatoryYear: 2026,
                summary: destaque,
                fullTextOrLink: inteiroTeor || null,
                theme: finalTheme,
                rapporteur: rapporteur,
                organ: organ,
                forAll: true,
                subjectId: Array.from(subjectIds)[0],
                processClass: processClass,
                processNumber: processNumber,
                subjects: {
                    connect: Array.from(subjectIds).map(id => ({ id }))
                }
            }
        });

        console.log(`Imported: ${fullProcess} (${organ}) - Subjects: ${Array.from(subjectIds).join(', ')}`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
