
import { PrismaClient, Court } from '@prisma/client';

const prisma = new PrismaClient();

const DATA = [
    {
        id: 1,
        process: 'REsp 2.158.358/MG',
        relator: 'Min. Gurgel de Faria',
        organ: 'Primeira Seção',
        subjects: ['Direito Processual Civil', 'Direito Tributário'],
        subjectIds: ['s-cproc', 's-trib'],
        title: 'Honorários em Embargos (Adesão ao REFIS/Tema 1317)',
        summary: 'A extinção dos embargos à execução fiscal em face da desistência ou da renúncia do direito manifestada para fins de adesão a programa de recuperação fiscal em que já inserida a verba honorária pela cobrança da dívida pública não enseja nova condenação em honorários advocatícios.',
        full: 'A questão submetida a julgamento sob o rito dos recursos repetitivos, nos termos do art. 1.036 do Código de Processo Civil, para formação de precedente vinculante previsto no art. 927, III, do Código de Processo Civil, é a seguinte: "definir se, à luz do CPC, é cabível a condenação do contribuinte em honorários advocatícios sucumbenciais em embargos à execução fiscal extintos com fundamento na desistência ou na renúncia de direito manifestada para fins de adesão a programa de recuperação fiscal, em que já está inserida a cobrança de verba honorária no âmbito administrativo.". A jurisprudência que o Superior Tribunal de Justiça sedimentou na vigência do Código de Processo Civil de 1973 foi no sentido de haver autonomia, ainda que relativa, entre a execução fiscal e os embargos do devedor, o que, em regra, justificaria a incidência de honorários advocatícios em cada uma dessas demandas. No entanto, em se tratando de desistência de embargos destinados à adesão a parcelamento incentivado ou a programa de recuperação fiscal que já incluam verba honorária em seu custeio, a jurisprudência evoluiu para afastar a duplicidade de condenação.',
        judgment: '2025-11-12',
        publication: '2025-12-24'
    },
    {
        id: 2,
        process: 'REsp 2.011.706/MG',
        relator: 'Geral',
        organ: 'STJ',
        subjects: ['Direito Penal', 'Execução Penal'],
        subjectIds: ['s-pen'], // Execução penal vai para s-pen aqui por simplicidade
        title: 'Comutação de Pena: Falta Grave nos 12 Meses (Tema 1195)',
        summary: 'O período de 12 meses a que se refere o art. 4º, I, do Decreto n. 9.246/2017 caracteriza-se pela não ocorrência de falta grave, não se relacionando à data de sua apuração, desde que já instaurado o processo administrativo disciplinar.',
        full: 'A questão submetida a julgamento sob o rito dos recursos repetitivos é a seguinte: "A possibilidade de comutação de pena, nos casos em que, embora tenha ocorrido a prática de falta grave nos últimos doze meses que antecederam a publicação do Decreto n. 9.246/2017, não conste homologação em juízo no mesmo período.". Nos termos do art. 4º, I, do Decreto n. 9.246/2017, o indulto natalino ou a comutação não será concedido às pessoas que "tenham sofrido sanção, aplicada pelo juízo competente em audiência de justificação, garantido o direito aos princípios do contraditório e da ampla defesa, em razão da prática de falta grave nos doze meses que antecederam a publicação do decreto".',
        judgment: '2026-02-03',
        publication: '2026-02-03'
    },
    {
        id: 3,
        process: 'HSE - Segredo de Justiça',
        relator: 'Min. Raul Araújo',
        organ: 'Corte Especial',
        subjects: ['Direito Civil', 'Direito Internacional', 'Direito Processual Civil'],
        subjectIds: ['s-civil', 's-inte', 's-cproc'],
        title: 'Legitimidade de Terceiro: Homologação de Divórcio Estrangeiro',
        summary: 'A legitimidade ativa para requerer homologação de sentença estrangeira não se limita às partes do processo alienígena, podendo ser exercida por qualquer pessoa que demonstre interesse jurídico direto e legítimo.',
        full: 'De início, é importante salientar que o presente pedido de homologação de sentença estrangeira é formulado por quem não foi parte no processo alienígena de divórcio. Tal fato, a princípio, não chega a impedir o pedido homologatório. O art. 216-C do Regimento Interno do Superior Tribunal de Justiça (RISTJ) dispõe que "a homologação da decisão estrangeira será proposta pela parte requerente...". Nesse contexto, entende-se que a orientação jurisprudencial acima referida ainda está conforme os novos regramentos do Código de Processo Civil de 2015. Destarte, para o interessado que não é parte no processo alienígena ser considerado parte legítima para requerer o pedido de homologação, deverá demonstrar a presença de interesse jurídico na homologação. Na hipótese, a ora requerente ("viúva"), busca a homologação de sentença estrangeira de divórcio, proferida na República Federal da Alemanha, entre seu falecido cônjuge e a ex-esposa dele. Tal interesse decorre da necessidade de regularização de seu estado civil no Brasil.',
        judgment: '2026-02-03',
        publication: '2026-02-03'
    },
    {
        id: 4,
        process: 'AgInt na Rcl 49.398/DF',
        relator: 'Geral',
        organ: 'STJ',
        subjects: ['Direito Constitucional', 'Direito Processual Civil'],
        subjectIds: ['s-const', 's-cproc'],
        title: 'Descabimento de Reclamação contra Decisão do Próprio STJ',
        summary: 'Não é cabível reclamação contra ato proferido por órgão julgador do próprio Superior Tribunal de Justiça.',
        full: 'A reclamação que é de atribuição do Superior Tribunal de Justiça está prevista no art. 105, I, f, da Constituição Federal e constitui garantia constitucional destinada à preservação da competência do Superior Tribunal de Justiça ou à garantia da autoridade de suas decisões, em caso de descumprimento de seus julgados. Vale dizer, "a reclamação constitucional é instituto voltado à higidez da hierarquia desta Corte Superior sobre os demais juízes e tribunais nacionais, não constituindo via adequada para impugnar decisão do próprio STJ, seja ela proveniente de qualquer dos seus órgãos colegiados ou de seus respectivos membros". No caso, o ato apontado como reclamado é decisão proferida pela Quarta Turma do STJ em Agravo em Recurso Especial.',
        judgment: '2026-02-03',
        publication: '2026-02-03'
    },
    {
        id: 5,
        process: 'P.S.J. Rogatória',
        relator: 'Min. Herman Benjamin',
        organ: 'Corte Especial',
        subjects: ['Direito Internacional', 'Direito Processual Civil'],
        subjectIds: ['s-inte', 's-cproc'],
        title: 'Produção de Provas: Carta Rogatória e Exequatur no STJ',
        summary: 'A medida de produção de prova, quando decorrente de decisão judicial estrangeira, deve ser submetida ao juízo delibatório do Superior Tribunal de Justiça, assegurando-se às partes as garantias do devido processo legal.',
        full: 'No caso, em atenção ao pedido de cooperação internacional, o Ministério da Justiça e Segurança Pública enviou ofício ao Superior Tribunal de Justiça com vistas à tramitação de Carta Rogatória, a qual tem como finalidade a colheita de prova, determinada nos autos da Ação de Regulação de Responsabilidades Parentais para a elaboração de relatório social. A controvérsia em discussão refere-se à natureza do pedido de cooperação internacional, isto é, se a medida pretendida é de caráter meramente informativo ou se exige exequatur por ser ato típico de função jurisdicional.',
        judgment: '2026-02-03',
        publication: '2026-02-03'
    },
    {
        id: 6,
        process: 'CC 210.253/DF',
        relator: 'Min. Antonio Carlos Ferreira',
        organ: 'Terceira Seção',
        subjects: ['Direito Processual Penal', 'Execução Penal'],
        subjectIds: ['s-pproc', 's-pen'],
        title: 'Competência: Execução de Reparação de Dano no ANPP',
        summary: 'Compete à Terceira Seção do Superior Tribunal de Justiça julgar conflito negativo de competência entre juízos cíveis e criminais sobre a execução da reparação do dano em ANPP.',
        full: 'A questão em discussão consiste em saber se compete ao órgão fracionário especializado na matéria criminal ou na matéria cível julgar conflito negativo de competência entre Juízos cível e criminal, acerca da competência para o processo de execução buscando o cumprimento da obrigação de reparar o dano estipulada em acordo de não persecução penal. Inicialmente, o critério para a definição do órgão competente para julgar o presente conflito no Superior Tribunal de Justiça é a natureza do título cuja execução se busca. O ANPP é um acordo criminal e não há previsão para sua execução no juízo cível.',
        judgment: '2026-02-03',
        publication: '2026-02-03'
    },
    {
        id: 7,
        process: 'MS 31.562/DF',
        relator: 'Geral',
        organ: 'STJ',
        subjects: ['Direito Administrativo'],
        subjectIds: ['s-admin'],
        title: 'Cotas Raciais: Proibição de Fracionamento de Vagas por Área',
        summary: 'O quantitativo de vagas reservadas às pessoas negras deve incidir sobre o total de vagas do cargo, vedado o fracionamento por áreas de especialização.',
        full: 'Cinge-se a controvérsia quanto à legalidade da reserva de cotas raciais sobre vaga única em especialidade com requisitos próprios e à distribuição das vagas reservadas por sorteio, sem observância dos critérios legais de alternância e proporcionalidade. No caso, o impetrante, primeiro colocado na ampla concorrência, sustentou que a destinação da única vaga às cotas raciais configura preterição. O Plenário do STF, no julgamento da ADC n. 41, fixou que os percentuais de reserva de vagas incidem em todas as fases dos concursos e que é inadmissível o fracionamento de vagas por especialidade com o objetivo de contornar a política de ação afirmativa.',
        judgment: '2026-02-03',
        publication: '2026-02-03'
    },
    {
        id: 8,
        process: 'MS 31.431/DF',
        relator: 'Min. Afrânio Vilela',
        organ: 'Primeira Seção',
        subjects: ['Direito Administrativo'],
        subjectIds: ['s-admin'],
        title: 'Mora Administrativa: Prazo no Julgamento de Recurso (CEBAS)',
        summary: 'Não é lícito à Administração postergar indefinidamente a análise do recurso administrativo contra o indeferimento do CEBAS, sob pena de afronta à razoável duração do processo.',
        full: 'Cuida-se de mandado de segurança em que se discute a existência de direito líquido e certo da impetrante ao julgamento, dentro do prazo legal, de recurso administrativo interposto contra o indeferimento do pedido de concessão do Certificado de Entidade Beneficente de Assistência Social - CEBAS. Examinando a legislação de regência, constata-se que o recurso interposto contra o indeferimento do pedido de concessão do CEBAS deveria ter sido apreciado no prazo máximo de 85 dias. A omissão da autoridade competente na apreciação do recurso administrativo por tempo excessivo viola os princípios da eficiência e da razoável duração do processo.',
        judgment: '2026-02-03',
        publication: '2026-02-03'
    },
    {
        id: 9,
        process: 'AgInt no AREsp 1.661.447/SP',
        relator: 'Geral',
        organ: 'STJ',
        subjects: ['Direito Administrativo'],
        subjectIds: ['s-admin'],
        title: 'Médicos do SUS: Cobrança Indevida e Improbidade (Enriquecimento)',
        summary: 'Não há reformatio in pejus na recapitulação da conduta ímproba de médica do SUS para enriquecimento ilícito diante de recurso da acusação buscando perdimento de bens.',
        full: 'No caso, foi ajuizada ação civil pública pelo Ministério Público do Estado de São Paulo contra médicos obstetras por exigirem de pacientes atendidas pelo SUS o pagamento de valores para realização de partos ou laqueaduras. O Tribunal recapitulou a conduta para o art. 9º da LIA (enriquecimento ilícito) diante do apelo do autor que visava a perda de valores ilicitamente acrescidos ao patrimônio dos agentes. Tal mudança é legítima quando amparada em recurso da parte autora.',
        judgment: '2026-02-03',
        publication: '2026-02-03'
    },
    {
        id: 10,
        process: 'REsp 2.181.090/DF',
        relator: 'Geral',
        organ: 'STJ',
        subjects: ['Direito Administrativo'],
        subjectIds: ['s-admin'],
        title: 'Prorrogação de Inquérito de Improbidade: Limite de uma Única Vez',
        summary: 'Após a Lei n. 14.230/2021, o inquérito civil para apuração de improbidade pode ser prorrogado apenas uma única vez por igual período de 365 dias.',
        full: 'No caso, determinada empresa questionou ato de Promotoria de Justiça que prorrogou sucessivamente o Inquérito Civil Público. Com as alterações da Nova Lei de Improbidade Administrativa, o prazo para conclusão do inquérito é peremptório: 365 dias, prorrogáveis uma única vez por igual período, sob pena de arquivamento ou ajuizamento da ação. A autonomia do Ministério Público não autoriza a manutenção perpétua de investigação sem as devidas cautelas legais.',
        judgment: '2026-02-03',
        publication: '2026-02-03'
    },
    {
        id: 11,
        process: 'AgInt no AREsp 2.049.321/MG',
        relator: 'Min. Francisco Falcão',
        organ: 'STJ',
        subjects: ['Direito Administrativo'],
        subjectIds: ['s-admin'],
        title: 'Publicidade de Apps (Uber/99) em Pontos de Ônibus',
        summary: 'A execução de contrato de transporte coletivo não pode proibir publicidade de transporte individual por aplicativo (Apps) em pontos de ônibus por suposta concorrência.',
        full: 'Cinge-se a controvérsia a verificar a legitimidade da proibição da veiculação de publicidade de serviços de transporte individual por meio de aplicativo em abrigos de pontos de ônibus. O STJ entendeu que não há concorrência direta entre o serviço de transporte urbano público coletivo e o individual privado por aplicativo. A relação é de complementaridade. Proibir tal publicidade violaria a Lei da Liberdade Econômica (Lei n. 13.874/2019) por impedir a adoção de novas tecnologias.',
        judgment: '2026-02-03',
        publication: '2026-02-03'
    },
    {
        id: 12,
        process: 'REsp 1.829.707/MG',
        relator: 'Geral',
        organ: 'STJ',
        subjects: ['Direito Ambiental'],
        subjectIds: ['s-ambi'],
        title: 'Inscrição no CAR desobriga Averbação de Reserva Legal na Matrícula',
        summary: 'A efetiva inscrição do imóvel rural no Cadastro Ambiental Rural (CAR) torna inexigível a obrigação de averbação da reserva legal na matrícula do imóvel.',
        full: 'O Superior Tribunal possui precedentes no sentido de que a Lei n. 12.651/2012 (Novo Código Florestal) substituiu a necessidade de averbação em matrícula pela inscrição no CAR, que é o registro público nacional obrigatório para todos os imóveis rurais, visando formar base de dados para controle ambiental.',
        judgment: '2026-02-03',
        publication: '2026-02-03'
    },
    {
        id: 13,
        process: 'REsp 2.202.015/DF',
        relator: 'Geral',
        organ: 'STJ',
        subjects: ['Direito Processual Civil'],
        subjectIds: ['s-cproc'],
        title: 'Recurso Cabível contra Homologação de Cálculos e Precatório',
        summary: 'O recurso cabível contra a decisão que homologa os cálculos e determina a expedição de precatório ou RPV na fase de cumprimento de sentença é a apelação.',
        full: 'A controvérsia consiste em determinar se a decisão que homologa os cálculos de liquidação e determina a expedição de precatório é impugnável por agravo de instrumento ou apelação. O STJ firmou entendimento de que tal decisão possui feição nitidamente terminativa da fase executória (ou de sua etapa principal), desafiando, portanto, recurso de apelação e não agravo.',
        judgment: '2026-02-03',
        publication: '2026-02-03'
    },
    {
        id: 14,
        process: 'REsp 2.011.981/SP',
        relator: 'Geral',
        organ: 'STJ',
        subjects: ['Direito Civil'],
        subjectIds: ['s-civil'],
        title: 'Impenhorabilidade: Bem de Família e Superveniente União Estável',
        summary: 'A constituição posterior de união estável e nascimento de filho após a hipoteca não impede o reconhecimento da impenhorabilidade do bem de família.',
        full: 'A controvérsia consiste em definir se supervenientes companheira e filho têm direito à proteção do bem de família legal no caso em que o imóvel no qual residem foi oferecido em hipoteca pelo garantidor quando ainda solteiro. À luz do direito fundamental à moradia e da proteção da entidade familiar, o STJ concluiu que a proteção do instituto não cessa, mesmo que a família tenha sido constituída após a dívida ou a garantia, desde que o bem sirva de residência efetiva.',
        judgment: '2026-02-03',
        publication: '2026-02-03'
    },
    {
        id: 15,
        process: 'REsp 2.214.287/MG',
        relator: 'Min. Nancy Andrighi',
        organ: 'Terceira Turma',
        subjects: ['Direito Civil'],
        subjectIds: ['s-civil'],
        title: 'Uso de Imagem em Documentário de Crime (Ausência de Prejuízo)',
        summary: 'Não há dano moral no uso de imagem em documentário sobre crime de grande repercussão quando a aparição é acidental, curta e sem divulgação de dados pessoais.',
        full: 'Cinge-se a controvérsia a determinar se viola direito de imagem do gravado a reprodução, sem a sua autorização, de trecho de matéria jornalística antiga em novo documentário. O STJ apontou que, inexistindo viés econômico ou comercial degradante, o uso informativo e histórico de imagens onde a pessoa aparece como coadjuvante de episódio histórico não gera dever de indenizar se respeitados os deveres de veracidade e pertinência.',
        judgment: '2026-02-03',
        publication: '2026-02-03'
    },
    {
        id: 16,
        process: 'REsp 2.233.886/RS',
        relator: 'Geral',
        organ: 'STJ',
        subjects: ['Direito Civil'],
        subjectIds: ['s-civil'],
        title: 'Impenhorabilidade de Pequena Propriedade Rural em Alienação Fiduciária',
        summary: 'A proteção da impenhorabilidade da pequena propriedade rural é aplicável mesmo que o bem tenha sido dado em alienação fiduciária.',
        full: 'O propósito recursal consiste em decidir se é aplicável a proteção da impenhorabilidade à hipótese em que o bem é oferecido como garantia em alienação fiduciária. O STJ concluiu que a impenhorabilidade de pequena propriedade rural explorada pela família é norma de ordem pública e direito fundamental indisponível, oponível tanto à penhora judicial quanto à consolidação extrajudicial da propriedade pelo credor fiduciário.',
        judgment: '2026-02-03',
        publication: '2026-02-03'
    },
    {
        id: 17,
        process: 'REsp 2.221.399/SP',
        relator: 'Geral',
        organ: 'STJ',
        subjects: ['Direito Civil', 'Direito do Consumidor'],
        subjectIds: ['s-civil', 's-cons'],
        title: 'Plano de Saúde: Cobertura de Terapia TREINI (Paralisia Cerebral)',
        summary: 'É obrigatória a cobertura de tratamentos multidisciplinares (método TREINI) aos beneficiários com paralisia cerebral por parte dos planos de saúde.',
        full: 'A Segunda Seção do STJ concluiu ser abusiva a recusa de cobertura de sessões de terapia especializada prescritas para pacientes com transtornos globais do desenvolvimento ou paralisia cerebral. Mesmo diante do rol da ANS, a preservação da saúde e dignidade do beneficiário impõe a cobertura do tratamento multidisciplinar prescrito pelo médico.',
        judgment: '2026-02-03',
        publication: '2026-02-03'
    },
    {
        id: 18,
        process: 'REsp 2.114.283/RJ',
        relator: 'Geral',
        organ: 'STJ',
        subjects: ['Direito Civil', 'Direito do Consumidor'],
        subjectIds: ['s-civil', 's-cons'],
        title: 'Cláusula de "Degustação" de Internet: Limite da Função Judicial',
        summary: 'Decisão judicial que impõe regra geral de "degustação" de serviço de internet extrapola a função jurisdicional e invade competência da ANATEL.',
        full: 'Na origem, ação civil pública contra operadoras de telefonia pedia melhorias no serviço 3G. O tribunal impôs a obrigação de as operadoras permitirem a "degustação" do serviço a todos os novos clientes. O STJ reformou a decisão por considerar que o Judiciário não pode criar regras regulatórias abstratas de caráter comercial, sob pena de violar a Lei Geral de Telecomunicações.',
        judgment: '2026-02-03',
        publication: '2026-02-03'
    },
    {
        id: 19,
        process: 'P.S.J. Alimentos',
        relator: 'Min. Nancy Andrighi',
        organ: 'STJ',
        subjects: ['Direito Civil', 'Direito Processual Civil'],
        subjectIds: ['s-civil', 's-cproc'],
        title: 'Nomeação de Curador Especial em Abandono de Ação de Alimentos',
        summary: 'O abandono da causa pelo representante legal em ação de alimentos configura conflito de interesses, autorizando a nomeação de curador especial.',
        full: 'A controvérsia consiste em decidir se a desídia da genitora ao abandonar a ação de alimentos em favor do filho autoriza a nomeação da Defensoria Pública como curadora. O STJ entendeu que, nesses casos, o interesse da criança em receber alimentos deve prevalecer sobre a inércia do representante, justificando a curadoria especial para garantir o melhor interesse do incapaz.',
        judgment: '2026-02-03',
        publication: '2026-02-03'
    },
    {
        id: 20,
        process: 'REsp 2.168.312/PR',
        relator: 'Geral',
        organ: 'STJ',
        subjects: ['Direito Civil', 'Direito Processual Civil'],
        subjectIds: ['s-civil', 's-cproc'],
        title: 'Cumulação de Honorários: Valor da Condenação e Proveito Econômico',
        summary: 'É possível cumular bases de cálculo de honorários sucumbenciais (condenação + proveito econômico) em ações declaratórias cumuladas com indenizatórias.',
        full: 'Cinge-se a controvérsia a determinar se em demandas de natureza dúplice é possível somar as bases de cálculo dos honorários. O STJ decidiu que o art. 85, § 2º do CPC permite que se considere tanto a parte condenatória em dinheiro quanto o proveito econômico da parte declaratória para o arbitramento da verba sucumbencial.',
        judgment: '2026-02-03',
        publication: '2026-02-03'
    },
    {
        id: 21,
        process: 'REsp 2.215.427/SP',
        relator: 'Geral',
        organ: 'STJ',
        subjects: ['Direito do Consumidor'],
        subjectIds: ['s-cons'],
        title: 'Redução de Limite de Cartão sem Aviso: Dano Moral Não Presumido',
        summary: 'A simples redução do limite do cartão de crédito sem prévia comunicação não gera dano moral in re ipsa, exigindo prova do prejuízo.',
        full: 'Embora a ausência de comunicação configure falha na prestação do serviço bancário (infração às normas do BACEN), o STJ entende que tal fato não viola automaticamente os direitos da personalidade. Para haver indenização, o consumidor deve comprovar situações vexatórias ou danos concretos decorrentes da redução repentina do limite.',
        judgment: '2026-02-03',
        publication: '2026-02-03'
    },
    {
        id: 22,
        process: 'REsp 2.230.998/SP',
        relator: 'Geral',
        organ: 'STJ',
        subjects: ['Direito Processual Civil'],
        subjectIds: ['s-cproc'],
        title: 'Desnecessidade de Incidente (IDPJ) em Sucessão Empresarial Fraudulenta',
        summary: 'Pode-se redirecionar a execução em caso de sucessão empresarial fraudulenta sem necessidade de instaurar o incidente de desconsideração da personalidade jurídica.',
        full: 'A controvérsia cinge-se a saber se é necessária a instauração de IDPJ para sucessão empresarial irregular. O STJ diferencia os institutos: na sucessão empresarial (formal ou de fato), a responsabilidade decorre de lei e do negócio jurídico, podendo o redirecionamento ser feito diretamente nos autos se houver indícios claros de fraude e continuação do negócio por nova empresa.',
        judgment: '2026-02-03',
        publication: '2026-02-03'
    },
    {
        id: 23,
        process: 'REsp 2.167.952/PE',
        relator: 'Geral',
        organ: 'STJ',
        subjects: ['Direito Processual Civil'],
        subjectIds: ['s-cproc'],
        title: 'Levantamento de Valor Incontroverso: Desnecessidade de Fiança',
        summary: 'No cumprimento definitivo de sentença, o levantamento de valores incontroversos não exige caução ou fiança bancária, independentemente do alto valor.',
        full: 'O propósito da controvérsia consiste em decidir se é possível exigir fiança bancária sobre valor incontroverso. O STJ decidiu que, por se tratar de execução definitiva e de valores que não são mais objeto de discussão, o credor tem direito ao levantamento imediato e incondicionado, não sendo o valor elevado justificativa por si só para retenção ou fiança.',
        judgment: '2026-02-03',
        publication: '2026-02-03'
    },
    {
        id: 24,
        process: 'REsp 2.197.464/SP',
        relator: 'Min. Nancy Andrighi',
        organ: 'STJ',
        subjects: ['Direito Processual Civil'],
        subjectIds: ['s-cproc'],
        title: 'Condenação do Advogado por Lide Temerária: Exigência de Ação Própria',
        summary: 'A responsabilidade do advogado por lide temerária ou uso de procuração falsa deve ser apurada em ação própria, e não nos mesmos autos da lide original.',
        full: 'O CPC determina que advogados não estão sujeitos a penas processuais por sua atuação profissional direta nos autos. Eventual dolo ou culpa do advogado no ajuizamento de demandas fraudulentas (lide temerária) atrai a responsabilidade do Estatuto da OAB, devendo ser apurada em processo autônomo de reparação de danos.',
        judgment: '2026-02-03',
        publication: '2026-02-03'
    },
    {
        id: 25,
        process: 'RHC 219.766/SP',
        relator: 'Min. Sebastião Reis Júnior',
        organ: 'Sexta Turma',
        subjects: ['Direito Penal'],
        subjectIds: ['s-pen'],
        title: 'Redução do Prazo Prescricional: Réu com 70 anos no Acórdão',
        summary: 'A redução do prazo prescricional pela metade (Art. 115 CP) aplica-se se o réu completar 70 anos antes do acórdão que altera substancialmente a sentença.',
        full: 'O STJ consolidou que o acórdão que altera substancialmente a pena aplicada (majorando-a ou alterando seu regime) serve como marco para a aferição da idade do réu. Se ele tiver 70 anos ou mais na data desse acórdão, faz jus à redução do prazo prescricional pela metade.',
        judgment: '2026-02-03',
        publication: '2026-02-03'
    }
];

async function main() {
    console.log('--- RESETTING DATABASE PRECEDENTS ---');
    await prisma.precedent.deleteMany();

    console.log('--- IMPORTING INF. 875 (25 JULGADOS) ---');

    for (const item of DATA) {
        console.log(`Importing: ${item.process} - ${item.title}`);

        await prisma.precedent.create({
            data: {
                court: Court.STJ,
                title: item.title,
                summary: item.summary,
                fullTextOrLink: item.full,
                informatoryNumber: '875',
                informatoryYear: 2026,
                processClass: item.process.split(' ')[0],
                processNumber: item.process.split(' ').slice(1).join(' '),
                rapporteur: item.relator,
                organ: item.organ,
                judgmentDate: item.judgment ? new Date(item.judgment) : null,
                publicationDate: item.publication ? new Date(item.publication) : null,
                forAll: true,
                subjectId: item.subjectIds[0], // Main subject to satisfy constraint
                subjects: {
                    connect: item.subjectIds.map(id => ({ id }))
                }
            }
        });
    }

    console.log('--- ALL 25 PRECEDENTS IMPORTED SUCCESSFULLY! ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
