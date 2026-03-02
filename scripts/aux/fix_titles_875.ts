import { prisma } from './src/lib/prisma';

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
    '2.168.312-PR': 'Honorários: possibilidade de somar base do proveito econômico e da condenação',
    '2.215.427-SP': 'Consumidor: redução do limite do cartão sem aviso não gera dano moral presumido',
    '2.230.998-SP': 'Execução: sucessão empresarial fraudulenta dispensa incidente de desconsideração (IDPJ)',
    '2.167.952-PE': 'Cumprimento de Sentença: levantamento de valor incontroverso não exige caução ou fiança',
    '2.197.464-SP': 'Responsabilidade: punição de advogado por lide temerária deve ser via ação própria',
    '219.766-SP': 'Prescrição: redução do prazo para réu com 70 anos na data de acórdão que agrava a pena',
    '210.253-DF': 'Competência: crimes cibernéticos e domicílio da vítima (Art. 70, § 4º CPP)',
    '49.398-DF': 'Reclamação: competência para cassar decisão contrária a precedente vinculante do STJ/STF',
    'segredo_alimentos': 'Incapaz: abandono de causa por representante em ação de alimentos exige curador especial'
};

async function fix() {
    const precedents = await prisma.precedent.findMany({
        where: { informatoryNumber: '875' }
    });

    console.log(`Fixing ${precedents.length} precedents...`);

    for (const p of precedents) {
        let updateData: any = {};

        // 1. Force Pipe Trick formatting if no pipe exists
        if (p.theme && !p.theme.includes('|')) {
            updateData.theme = `| ${p.theme.trim()}`;
        }

        // 2. Find smart summary
        let foundKey = Object.keys(SUMMARIES).find(k => p.processNumber?.includes(k));

        // Specialized check for "segredo de justiça" with keywords
        if (!foundKey && p.processClass === 'Segredo') {
            if (p.summary.includes('alimentos')) foundKey = 'segredo_alimentos';
        }

        if (foundKey) {
            updateData.title = SUMMARIES[foundKey];
        }

        if (Object.keys(updateData).length > 0) {
            await prisma.precedent.update({
                where: { id: p.id },
                data: updateData
            });
            console.log(`Updated: ${p.processNumber || 'Segredo'} -> ${updateData.title || p.title}`);
        }
    }
}

fix()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
