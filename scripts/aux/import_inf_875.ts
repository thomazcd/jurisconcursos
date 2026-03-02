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

const SUMMARIES: Record<string, string> = {
    '2.158.358-MG': 'Honorários em execução fiscal após adesão ao REFIS: vedado bis in idem',
    '2.011.706-MG': 'Comutação de pena: período impeditivo de 12 meses refere-se ao cometimento da falta grave',
    '31.562-DF': 'Servidor público aposentado: revisão de proventos e direito adquirido sob nova lei',
    '31.431-DF': 'Anistia política: revisão de portarias e dever de fundamentação baseada em fatos reais',
    '1.661.447-SP': 'Improbidade Administrativa: debate sobre prescrição intercorrente e Lei 14.230/21',
    '2.181.090-DF': 'Conselhos de Fiscalização: limites de valores e formas de cobrança de anuidades',
    '2.049.321-MG': 'Improbidade: aplicação retroativa de normas benéficas da Nova Lei de Improbidade',
    '1.829.707-MG': 'Dano Ambiental: obrigação de recuperar APP em área urbana consolidada',
    '2.202.015-DF': 'Processual: comprovante de agendamento bancário não prova preparo recursal',
    '2.011.981-SP': 'Bem de família: impenhorabilidade do imóvel do fiador em locação comercial (Tema STF 1127)',
    '2.214.287-MG': 'Direito de Imagem: uso acidental em documentário sem autorização e inexistência de dano moral',
    '2.233.886-RS': 'Contratos: validade de alienação fiduciária de imóvel rural por empresa estrangeira',
    '2.221.399-SP': 'Plano de Saúde: obrigação de custeio de tratamento multidisciplinar para paralisia cerebral',
    '2.114.283-RJ': 'Internet 3G: decisão judicial sobre "degustação" invade competência da ANATEL',
    '2.168.312-PR': 'Honorários: possível somar base do proveito econômico e da condenação',
    '2.215.427-SP': 'Consumidor: redução do limite do cartão sem aviso não gera dano moral presumido',
    '2.230.998-SP': 'Execução: sucessão empresarial fraudulenta dispensa incidente de desconsideração (IDPJ)',
    '2.167.952-PE': 'Cumprimento de Sentença: levantamento de valor incontroverso independe de caução',
    '2.197.464-SP': 'Responsabilidade: punição de advogado por lide temerária deve ser via ação própria',
    '219.766-SP': 'Prescrição: redução do prazo para réu com 70 anos na data de acórdão que agrava a pena',
    '210.253-DF': 'Competência: crimes cibernéticos e domicílio da vítima (Art. 70, § 4º CPP)',
    '49.398-DF': 'Reclamação: competência para cassar decisão contrária a precedente vinculante do STJ/STF',
    'alimentos': 'Incapaz: abandono de causa por representante em ação de alimentos exige curador especial',
    'sentença estrangeira': 'Homologação: prova de trânsito em julgado e legalização de documentos estrangeiros',
    'insígnia': 'Dano Moral Coletivo: uso indevido de insígnia de corporação oficial em produto comercial',
    'paralisia': 'Saúde: plano de saúde deve cobrir tratamento multidisciplinar para menor com paralisia',
    'cooperação jurídica': 'Internacional: limites da cooperação jurídica para obtenção de provas no exterior'
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

    for (let block of blocks) {
        if (!block.trim().startsWith('PROCESSO ')) continue;
        if (block.includes('PROCESSO ProAfR ')) continue;

        // Process line up to RAMO DO DIREITO
        const processMatch = block.match(/PROCESSO ([\s\S]+?) RAMO DO DIREITO/);
        if (!processMatch) continue;
        const processLine = processMatch[1].trim();

        const processParts = processLine.split(',');
        const fullProcess = processParts[0].trim();
        const rapporteur = processLine.match(/Rel\. (?:p\/ acórdão )?Ministr[oa] ([\s\S]+?)(?:,|$)/)?.[1]?.trim() || '';
        const organMatch = processLine.match(/Ministr[oa] [\s\S]+?, ([\s\S]+?),/);
        const organ = organMatch ? organMatch[1].trim() : '';

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
        let inteiroTeor = teorMatch ? teorMatch[1].trim() : '';
        inteiroTeor = inteiroTeor.replace(/Informativo de Jurisprudência n\. 875 3 de fevereiro de 2026\. processo\.stj\.jus.br\/jurisprudencia\/externo\/informativo\/ \d+\/47/g, '');
        inteiroTeor = inteiroTeor.replace(/\s+/g, ' ').trim();

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
        let foundKey = Object.keys(SUMMARIES).find(k => (processNumber || fullProcess).includes(k));
        if (!foundKey) {
            foundKey = Object.keys(SUMMARIES).find(k =>
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

        if (subjectIds.size === 0) continue;

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
