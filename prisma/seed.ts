import { PrismaClient, Role, TrackScope, Court, Applicability } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // ── 1. Create users ──────────────────────────────────────────────────────────
    const adminHash = await bcrypt.hash('admin123', 12);
    const userHash = await bcrypt.hash('user123', 12);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@juris.com' },
        update: {},
        create: {
            name: 'Administrador',
            email: 'admin@juris.com',
            passwordHash: adminHash,
            role: Role.ADMIN,
            profile: { create: { activeTrack: 'JUIZ' } },
        },
    });

    const gestor = await prisma.user.upsert({
        where: { email: 'gestor@juris.com' },
        update: {},
        create: {
            name: 'Gestor de Conteúdo',
            email: 'gestor@juris.com',
            passwordHash: adminHash,
            role: Role.GESTOR,
            profile: { create: { activeTrack: 'JUIZ' } },
        },
    });

    const userJuiz = await prisma.user.upsert({
        where: { email: 'juiz@juris.com' },
        update: {},
        create: {
            name: 'Carlos Magistrado',
            email: 'juiz@juris.com',
            passwordHash: userHash,
            role: Role.USER,
            profile: { create: { activeTrack: 'JUIZ' } },
        },
    });

    const userProc = await prisma.user.upsert({
        where: { email: 'procurador@juris.com' },
        update: {},
        create: {
            name: 'Ana Procuradora',
            email: 'procurador@juris.com',
            passwordHash: userHash,
            role: Role.USER,
            profile: { create: { activeTrack: 'PROCURADOR' } },
        },
    });

    console.log('✅ Users created');

    // ── 2. Create subjects ────────────────────────────────────────────────────────
    const subjectsData = [
        // 8 COMMON
        { name: 'Direito Constitucional', trackScope: TrackScope.COMMON },
        { name: 'Direito Administrativo', trackScope: TrackScope.COMMON },
        { name: 'Direito Civil', trackScope: TrackScope.COMMON },
        { name: 'Direito Processual Civil', trackScope: TrackScope.COMMON },
        { name: 'Direito Penal', trackScope: TrackScope.COMMON },
        { name: 'Direito Processual Penal', trackScope: TrackScope.COMMON },
        { name: 'Direito Tributário', trackScope: TrackScope.COMMON },
        { name: 'Direito do Trabalho e Processual do Trabalho', trackScope: TrackScope.COMMON },
        // 4 PROCURADOR only
        { name: 'Direito Financeiro e Orçamentário', trackScope: TrackScope.PROCURADOR },
        { name: 'Responsabilidade Civil do Estado', trackScope: TrackScope.PROCURADOR },
        { name: 'Licitações e Contratos Administrativos', trackScope: TrackScope.PROCURADOR },
        { name: 'Improbidade Administrativa', trackScope: TrackScope.PROCURADOR },
        // 4 JUIZ only
        { name: 'Teoria Geral do Processo e Prova', trackScope: TrackScope.JUIZ },
        { name: 'Recursos e Meios de Impugnação', trackScope: TrackScope.JUIZ },
        { name: 'Execução Civil e Cumprimento de Sentença', trackScope: TrackScope.JUIZ },
        { name: 'Ética Judicial e Estatuto da Magistratura', trackScope: TrackScope.JUIZ },
    ];

    const subjects: Record<string, string> = {};
    for (const s of subjectsData) {
        const created = await prisma.subject.upsert({
            where: { id: `seed-${s.name.substring(0, 10).replace(/\s/g, '-').toLowerCase()}` },
            update: {},
            create: { id: `seed-${s.name.substring(0, 10).replace(/\s/g, '-').toLowerCase()}`, ...s },
        });
        subjects[s.name] = created.id;
    }

    console.log('✅ Subjects created');

    // ── 3. Create precedents ──────────────────────────────────────────────────────
    const precedentsData = [
        // GERAL – aparecem para todos
        {
            court: Court.STF,
            title: 'RE 593.068 – Proibição do retrocesso social',
            summary:
                'O princípio da vedação ao retrocesso social impede que o legislador suprima, sem compensação adequada, conquistas já incorporadas ao patrimônio dos cidadãos em matéria de direitos fundamentais sociais.',
            fullTextOrLink: 'https://jurisprudencia.stf.jus.br/pages/search?base=acordaos&pesquisa_inteiro_teor=false&sinonimo=true&plural=true&radicais=false&buscaexata=false&index=i2a&tipoPesquisa=&sort=_score&sortBy=desc&isAdvanced=true&paginaFixa=false&origem=acordao&query=RE+593068',
            subjectId: subjects['Direito Constitucional'],
            applicability: Applicability.GERAL,
            tags: ['direitos fundamentais', 'retrocesso social', 'legislativo'],
        },
        {
            court: Court.STJ,
            title: 'REsp 1.737.428 – Responsabilidade civil por dano moral coletivo',
            summary:
                'A pessoa jurídica de direito público pode ser condenada ao pagamento de dano moral coletivo quando sua conduta omissiva ou comissiva viola direitos difusos ou coletivos de forma injustificada.',
            fullTextOrLink: 'https://scon.stj.jus.br/SCON/GetInteiroTeorDoAcordao?num_registro=201801283460&dt_publicacao=12/09/2019',
            subjectId: subjects['Direito Administrativo'],
            applicability: Applicability.GERAL,
            tags: ['dano moral coletivo', 'direitos difusos', 'Estado'],
        },
        {
            court: Court.STF,
            title: 'ADC 49 – Inconstitucionalidade do ICMS na transferência entre estabelecimentos do mesmo titular',
            summary:
                'É inconstitucional a incidência do ICMS nas transferências de mercadorias entre estabelecimentos do mesmo titular, pois não há operação mercantil nem circulação econômica.',
            fullTextOrLink: 'https://jurisprudencia.stf.jus.br/pages/search?base=acordaos&query=ADC+49',
            subjectId: subjects['Direito Tributário'],
            applicability: Applicability.GERAL,
            tags: ['ICMS', 'transferência', 'estabelecimentos', 'tributário'],
        },
        {
            court: Court.STJ,
            title: 'Súmula 636 – Prescrição intercorrente em execução fiscal',
            summary:
                'A prescrição intercorrente pode ser decretada de ofício, sendo necessária a intimação da Fazenda Pública para que se manifeste antes da decisão.',
            fullTextOrLink: 'https://scon.stj.jus.br/SCON/sumanot/toc.jsp?livre=636',
            subjectId: subjects['Direito Tributário'],
            applicability: Applicability.GERAL,
            tags: ['prescrição intercorrente', 'execução fiscal', 'Fazenda Pública'],
        },
        {
            court: Court.STF,
            title: 'RE 598.099 – Concurso público: direito subjetivo à nomeação',
            summary:
                'O candidato aprovado dentro do número de vagas previstas no edital possui direito subjetivo à nomeação, podendo exigi-la judicialmente caso a Administração deixe de fazê-la sem justificativa.',
            fullTextOrLink: 'https://jurisprudencia.stf.jus.br/pages/search?base=acordaos&query=RE+598099',
            subjectId: subjects['Direito Administrativo'],
            applicability: Applicability.GERAL,
            tags: ['concurso público', 'nomeação', 'vagas', 'direito subjetivo'],
        },
        {
            court: Court.STJ,
            title: 'REsp 1.771.278 – Responsabilidade objetiva do Estado',
            summary:
                'O Estado responde objetivamente pelos danos causados por seus agentes a terceiros, sendo prescindível a comprovação de dolo ou culpa, bastando o nexo de causalidade entre a conduta e o dano.',
            fullTextOrLink: 'https://scon.stj.jus.br/SCON/',
            subjectId: subjects['Direito Administrativo'],
            applicability: Applicability.GERAL,
            tags: ['responsabilidade objetiva', 'nexo de causalidade', 'agente público'],
        },
        // JUIZ – específicos
        {
            court: Court.STF,
            title: 'ADI 5.766 – Honorários sucumbenciais e beneficiário da justiça gratuita',
            summary:
                'É inconstitucional a cobrança de honorários sucumbenciais de beneficiário da justiça gratuita, mesmo quando vencido na reclamação trabalhista, violando o acesso à justiça.',
            fullTextOrLink: 'https://jurisprudencia.stf.jus.br/pages/search?base=acordaos&query=ADI+5766',
            subjectId: subjects['Direito do Trabalho e Processual do Trabalho'],
            applicability: Applicability.JUIZ,
            tags: ['justiça gratuita', 'honorários sucumbenciais', 'acesso à justiça'],
        },
        {
            court: Court.STJ,
            title: 'EREsp 1.076.914 – Fungibilidade recursal em mandado de segurança',
            summary:
                'O recurso equivocado pode ser recebido como o correto quando presentes boa-fé e erro escusável, aplicando-se o princípio da fungibilidade recursal.',
            fullTextOrLink: 'https://scon.stj.jus.br/SCON/',
            subjectId: subjects['Recursos e Meios de Impugnação'],
            applicability: Applicability.JUIZ,
            tags: ['fungibilidade', 'recurso', 'mandado de segurança', 'boa-fé'],
        },
        {
            court: Court.STJ,
            title: 'REsp 1.955.539 – Penhora de salário e mínimo existencial',
            summary:
                'Admite-se a penhora de parcela do salário para pagamento de dívidas não alimentares quando o devedor possui remuneração superior a 50 salários mínimos, preservando-se o mínimo existencial.',
            fullTextOrLink: 'https://scon.stj.jus.br/SCON/',
            subjectId: subjects['Execução Civil e Cumprimento de Sentença'],
            applicability: Applicability.JUIZ,
            tags: ['penhora', 'salário', 'mínimo existencial', 'execução'],
        },
        {
            court: Court.STF,
            title: 'ADPF 347 – Estado de Coisas Inconstitucional no sistema prisional',
            summary:
                'O sistema carcerário brasileiro configura Estado de Coisas Inconstitucional, com violação massiva e sistêmica de direitos fundamentais dos presos, exigindo atuação coordenada dos poderes.',
            fullTextOrLink: 'https://jurisprudencia.stf.jus.br/pages/search?base=acordaos&query=ADPF+347',
            subjectId: subjects['Direito Constitucional'],
            applicability: Applicability.JUIZ,
            tags: ['sistema prisional', 'direitos fundamentais', 'estado de coisas inconstitucional'],
        },
        // PROCURADOR – específicos
        {
            court: Court.STJ,
            title: 'REsp 1.515.308 – Tomada de contas especial e prescrição',
            summary:
                'O prazo prescricional para a Administração instaurar Tomada de Contas Especial em face de agente que causou dano ao erário é de 5 anos, contados a partir do conhecimento do dano.',
            fullTextOrLink: 'https://scon.stj.jus.br/SCON/',
            subjectId: subjects['Improbidade Administrativa'],
            applicability: Applicability.PROCURADOR,
            tags: ['tomada de contas', 'prescrição', 'erário', 'dano'],
        },
        {
            court: Court.STF,
            title: 'RE 835.558 – Responsabilidade subsidiária da Administração em terceirização',
            summary:
                'Nas contratações de serviços terceirizados pela Administração Pública, a responsabilidade subsidiária do ente público depende de comprovação específica de conduta culposa na fiscalização do contrato.',
            fullTextOrLink: 'https://jurisprudencia.stf.jus.br/pages/search?base=acordaos&query=RE+835558',
            subjectId: subjects['Licitações e Contratos Administrativos'],
            applicability: Applicability.PROCURADOR,
            tags: ['terceirização', 'responsabilidade subsidiária', 'fiscalização', 'contrato'],
        },
        {
            court: Court.STJ,
            title: 'EREsp 1.197.953 – Responsabilidade civil por omissão do Estado',
            summary:
                'A responsabilidade civil do Estado por omissão é subjetiva, exigindo comprovação de culpa anônima (falha no serviço), salvo nas hipóteses de risco criado pela própria Administração.',
            fullTextOrLink: 'https://scon.stj.jus.br/SCON/',
            subjectId: subjects['Responsabilidade Civil do Estado'],
            applicability: Applicability.PROCURADOR,
            tags: ['responsabilidade subjetiva', 'omissão', 'culpa anônima', 'falha no serviço'],
        },
        {
            court: Court.STF,
            title: 'RE 870.947 – Correção monetária de débitos da Fazenda Pública',
            summary:
                'A correção monetária e os juros moratórios incidentes sobre condenações da Fazenda Pública devem ser calculados conforme o índice oficial de remuneração da caderneta de poupança (art. 1º-F da Lei 9.494/1997), declarado constitucional.',
            fullTextOrLink: 'https://jurisprudencia.stf.jus.br/pages/search?base=acordaos&query=RE+870947',
            subjectId: subjects['Direito Financeiro e Orçamentário'],
            applicability: Applicability.PROCURADOR,
            tags: ['correção monetária', 'juros', 'Fazenda Pública', 'precatório'],
        },
        // AMBOS
        {
            court: Court.STF,
            title: 'ADI 6.357 – Dispensa de licitação durante pandemia',
            summary:
                'São constitucionais as normas que dispensam a licitação para aquisição de bens e serviços destinados ao enfrentamento de calamidade pública, desde que observados os princípios da transparência e controle.',
            fullTextOrLink: 'https://jurisprudencia.stf.jus.br/pages/search?base=acordaos&query=ADI+6357',
            subjectId: subjects['Licitações e Contratos Administrativos'],
            applicability: Applicability.AMBOS,
            tags: ['licitação', 'pandemia', 'calamidade pública', 'dispensa'],
        },
        {
            court: Court.STJ,
            title: 'REsp 1.809.548 – Prazo prescricional em ação de improbidade',
            summary:
                'O prazo prescricional para as ações de improbidade administrativa é de 8 anos, contados do término do mandato, cargo em comissão ou função de confiança, conforme o art. 23 da Lei 8.429/1992.',
            fullTextOrLink: 'https://scon.stj.jus.br/SCON/',
            subjectId: subjects['Improbidade Administrativa'],
            applicability: Applicability.AMBOS,
            tags: ['improbidade administrativa', 'prescrição', 'mandato', '8 anos'],
        },
    ];

    for (const p of precedentsData) {
        await prisma.precedent.create({ data: p });
    }

    console.log(`✅ ${precedentsData.length} precedents created`);
    console.log('');
    console.log('🎉 Seed complete!');
    console.log('');
    console.log('Test accounts:');
    console.log('  admin@juris.com     / admin123  (ADMIN)');
    console.log('  gestor@juris.com    / admin123  (GESTOR)');
    console.log('  juiz@juris.com      / user123   (USER – perfil JUIZ)');
    console.log('  procurador@juris.com / user123  (USER – perfil PROCURADOR)');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
