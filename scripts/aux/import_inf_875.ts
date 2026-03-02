import { prisma } from '../../src/lib/prisma';
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

const SUMMARIES: Record<string, string> = {
    '2.158.358-MG': 'Honorários: Desistência de embargos para adesão ao REFIS não gera nova condenação (Tema 1317)',
    '2.011.706-MG': 'Comutação: Falta grave nos 12 meses anteriores impede o benefício (Tema 1195)',
    'divórcio': 'Homologação de Sentença Estrangeira (Divórcio) por terceiro interessado: legitimidade',
    'Raul Araújo': 'Homologação de Sentença Estrangeira (Divórcio) por terceiro interessado',
    'Herman Benjamin': 'Cooperação Internacional: Produção de prova por decisão estrangeira requer carta rogatória (exequatur)',
    '49.398-DF': 'Reclamação Constitucional: Descabimento contra ato de órgão do próprio STJ',
    '210.253-DF': 'Competência: Execução de reparação de dano em ANPP é da Terceira Seção (matéria criminal)',
    '31.562-DF': 'Concurso: Cotas raciais incidem sobre o total de vagas, vedado fracionamento por especialidade',
    '31.431-DF': 'CEBAS: Mora administrativa excessiva no julgamento de recurso viola a razoável duração do processo',
    '1.661.447-SP': 'Improbidade: Recapitulação da conduta em recurso da acusação não é reformatio in pejus',
    '2.181.090-DF': 'Improbidade: Inquérito civil pode ser prorrogado apenas uma única vez por 365 dias (Lei 14.230/2021)',
    '2.049.321-MG': 'Mobilidade: Execução de contrato de transporte não pode proibir propaganda de Apps em pontos de ônibus',
    '1.829.707-MG': 'Ambiental: Inscrição no CAR torna desnecessária a averbação da reserva legal na matrícula',
    '2.202.015-DF': 'Processual: Recurso contra homologação de cálculos em cumprimento de sentença é a apelação',
    '2.011.981-SP': 'Bem de Família: Impenhorabilidade mantida mesmo com união estável superveniente à hipoteca',
    '2.214.287-MG': 'Imagem: Uso acidental em documentário de crime histórico sem dano moral (específico)',
    '2.233.886-RS': 'Impenhorabilidade: Pequena propriedade rural protegida mesmo se dada em alienação fiduciária',
    '2.221.399-SP': 'Saúde: Plano de saúde deve cobrir terapia multidisciplinar (TREINI) para paralisia cerebral',
    '2.114.283-RJ': 'Internet 3G: Judiciário não pode impor regra de "degustação" (Invasão ANATEL)',
    'alimentos': 'Alimentos: Abandono de causa por representante legal do incapaz exige curador especial',
    '2.168.312-PR': 'Honorários: Possível cumular bases de cálculo (condenação + proveito econômico) em ações dúplices',
    '2.215.427-SP': 'Consumidor: Redução de limite de cartão sem aviso não gera dano moral presumido (in re ipsa)',
    '2.230.998-SP': 'Processual: Sucessão empresarial fraudulenta permite redirecionamento sem necessidade de IDPJ',
    '2.167.952-PE': 'Processual: Levantamento de valor incontroverso independe de caução ou fiança',
    '2.197.464-SP': 'Advogado: Responsabilidade por lide temerária deve ser apurada em ação própria (Estatuto OAB)',
    '219.766-SP': 'Penal: Redução da prescrição (Art. 115 CP) para réu com 70 anos na data de acórdão substancial',
};

function parseSTJDate(dateStr: string | null | undefined): Date | null {
    if (!dateStr) return null;
    const parts = dateStr.trim().split('/');
    if (parts.length === 3) {
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]), 12, 0, 0);
    }
    return null;
}

async function main() {
    console.log('Cleaning Inf 875...');
    await prisma.precedent.deleteMany({ where: { informatoryNumber: '875' } });

    const raw = fs.readFileSync('/Users/thomazdrumond/Downloads/Thomaz/juris-concursos/inf875_raw.txt', 'utf8');
    // SPACE NORMALIZATION: single spaces everywhere
    const normalized = raw.replace(/\r\n/g, '\n').replace(/\s+/g, ' ');

    // SPLIT BY PROCESSO, keeping it.
    const blocks = normalized.split(/(?=PROCESSO )/);

    console.log(`Found ${blocks.length} blocks candidate.`);

    // Clear previous imports for this informatory to allow fresh re-import with fixed formatting
    await prisma.precedent.deleteMany({
        where: { informatoryNumber: '875' }
    });
    console.log("Cleared existing Informativo 875 precedents.");

    const processed = new Set<string>();

    for (let block of blocks) {
        if (!block.trim().startsWith('PROCESSO ')) continue;
        if (block.includes('PROCESSO ProAfR ')) continue;

        // Process line up to RAMO DO DIREITO
        const processMatch = block.match(/PROCESSO ([\s\S]+?) RAMO DO DIREITO/);
        if (!processMatch) continue;
        const processLine = processMatch[1].trim();

        const processParts = processLine.split(',');
        const fullProcess = processParts[0].trim();

        // RELATOR EXTRACTION (Handling Relator + Relator para acórdão)
        const relBaseMatch = processLine.match(/Rel\. Ministr[oa] ([\s\S]+?)(?:,|$)/);
        const relAcrdMatch = processLine.match(/Rel\. (?:para acórdão|p\/ acórdão) Ministr[oa] ([\s\S]+?)(?:,|$)/);

        let rapporteur = "";
        let rapporteurNameForLookup = "";

        if (relBaseMatch && relAcrdMatch) {
            rapporteur = `Rel. Min. ${relBaseMatch[1].trim()}, Rel. p/ acórdão Min. ${relAcrdMatch[1].trim()}`;
            rapporteurNameForLookup = relAcrdMatch[1].trim();
        } else if (relBaseMatch) {
            rapporteurNameForLookup = relBaseMatch[1].trim();
            rapporteur = `Min. ${rapporteurNameForLookup}`;
        }

        // DEDUPLICATION
        const dedupeKey = `${fullProcess}-${rapporteurNameForLookup}`;
        if (processed.has(dedupeKey)) continue;
        processed.add(dedupeKey);

        // ORGAN EXTRACTION (Whitelist approach for STJ)
        const organOptions = [
            "Corte Especial",
            "Primeira Seção", "Segunda Seção", "Terceira Seção", "1ª Seção", "2ª Seção", "3ª Seção",
            "Primeira Turma", "Segunda Turma", "Terceira Turma", "Quarta Turma", "Quinta Turma", "Sexta Turma",
            "1ª Turma", "2ª Turma", "3ª Turma", "4ª Turma", "5ª Turma", "6ª Turma"
        ];

        let organ = "";
        for (const opt of organOptions) {
            if (processLine.includes(opt)) {
                organ = opt;
                break;
            }
        }

        // DATE EXTRACTION from the normalized block
        const judgmentMatch = processLine.match(/julgado em (\d{1,2}\/\d{1,2}\/\d{4})/);
        const publicationMatch = processLine.match(/(?:DJEN|DJe) (\d{1,2}\/\d{1,2}\/\d{4})/);
        const judgmentDate = parseSTJDate(judgmentMatch ? judgmentMatch[1] : null);
        const publicationDate = parseSTJDate(publicationMatch ? publicationMatch[1] : null);

        const themeMatch = processLine.match(/\(Tema\s+(\d+)\)/);
        const themeNumber = themeMatch ? `Tema ${themeMatch[1]}` : null;

        const ramosMatch = block.match(/RAMO DO DIREITO ([\s\S]+?) TEMA/);
        const ramosStr = ramosMatch ? ramosMatch[1].trim() : '';
        const subjectIds = new Set<string>();
        for (const [key, id] of Object.entries(SUBJECT_MAPPING)) {
            if (ramosStr.includes(key)) subjectIds.add(id);
        }

        const temaAssuntoMatch = block.match(/TEMA ([\s\S]+?) DESTAQUE/);
        let temaAssunto = temaAssuntoMatch ? temaAssuntoMatch[1].trim() : '';

        const destaqueMatch = block.match(/DESTAQUE ([\s\S]+?) (?:INFORMAÇÕES DO INTEIRO TEOR|INFORMAÇÕES ADICIONAIS|ÁUDIO DO TEXTO|PRECEDENTES QUALIFICADOS|LEGISLAÇÃO)/);
        const destaque = destaqueMatch ? destaqueMatch[1].trim() : '';

        const teorMatch = block.match(/INFORMAÇÕES DO INTEIRO TEOR ([\s\S]+?) (?:INFORMAÇÕES ADICIONAIS|ÁUDIO DO TEXTO|PROCESSO|PRECEDENTES QUALIFICADOS|LEGISLAÇÃO)/);

        // SMARTER PARAGRAPH RECONSTRUCTION
        let cleanedTeor = teorMatch ? teorMatch[1] : '';
        // Remove known footers/headers found inside blocks
        cleanedTeor = cleanedTeor.replace(/Informativo de Jurisprudência n\. 875[\s\S]+?\/47/g, '');

        const teorLines = cleanedTeor.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
        let rebuiltTeor = "";

        for (let i = 0; i < teorLines.length; i++) {
            const line = teorLines[i];
            const next = teorLines[i + 1];

            rebuiltTeor += line;

            if (next) {
                const lastChar = line[line.length - 1];
                const endsInPunct = /[.!?:]/.test(lastChar);
                const nextIsCapital = /^[A-ZÀ-Ú]/.test(next);

                // Heuristic: Period + Capital = New Paragraph
                if (endsInPunct && nextIsCapital) {
                    rebuiltTeor += "\n\n";
                } else {
                    rebuiltTeor += " ";
                }
            }
        }
        let inteiroTeor = rebuiltTeor.replace(/[ \t]+/g, ' ').trim();

        const finalTheme = themeNumber ? `${themeNumber} | ${temaAssunto}` : `| ${temaAssunto}`;

        let processClass = '';
        let processNumber = '';
        if (fullProcess.toLowerCase().includes('segredo')) {
            processClass = 'Segredo';
        } else {
            const m = fullProcess.match(/^([A-Za-z]+(?: no [A-Za-z]+)?)\s+(.+)$/);
            if (m) {
                processClass = m[1].trim();
                processNumber = m[2].trim();
            } else {
                processClass = fullProcess;
            }
        }

        let title = '';
        // Try to find key in summaries based on Process Number, or Keywords, or Relator (for Segredo)
        let foundKey = Object.keys(SUMMARIES).find(k => (processNumber || fullProcess).includes(k));
        if (!foundKey) {
            foundKey = Object.keys(SUMMARIES).find(k =>
                rapporteurNameForLookup.includes(k) ||
                temaAssunto.toLowerCase().includes(k.toLowerCase()) ||
                destaque.toLowerCase().includes(k.toLowerCase())
            );
        }

        if (foundKey) {
            title = SUMMARIES[foundKey];
        } else {
            title = temaAssunto.split('.')[0].trim();
            if (title.length > 100) title = title.substring(0, 97) + '...';
        }

        if (subjectIds.size === 0) {
            console.log(`Skipping ${fullProcess}: No subjects found for '${ramosStr}'`);
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
                judgmentDate: judgmentDate,
                publicationDate: publicationDate,
                forAll: true,
                subjectId: Array.from(subjectIds)[0],
                processClass: processClass,
                processNumber: processNumber,
                subjects: { connect: Array.from(subjectIds).map(id => ({ id })) }
            }
        });

        console.log(`Imported: ${processClass} ${processNumber} (Judge: ${judgmentMatch?.[1] || '---'}, Pub: ${publicationMatch?.[1] || '---'}) -> ${title}`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
