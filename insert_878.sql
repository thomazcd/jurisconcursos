-- =============================================
-- Informativo STJ 878 – 24/02/2026 (14 julgados)
-- =============================================

INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "isRG", "informatoryNumber", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags", "createdAt", "updatedAt") VALUES (
  gen_random_uuid()::text, 'STJ', 'Remessa necessária. Art. 496, § 3º, I, do CPC/2015. Demandas previdenciárias. Condenação aferível por simples cálculos aritméticos. Liquidez material. Arts. 509, § 2º, e 786, parágrafo único, do CPC/2015. Tema 17/STJ e Súmula n. 490/STJ. Distinção. I', 'A demanda previdenciária cujo valor da condenação seja aferível por simples cálculos aritméticos, com base nos parâmetros fixados na sentença, deve ser dispensada da remessa necessária quando for possível estimar que não excederá o limite previsto no art. 496, § 3º, I, do Código de Processo Civil.',
  's-cproc', '2026-02-04', FALSE, '878',
  'REsp', '1.882.236-RS', 'Corte Especial', 'Og Fernandes', 'Tema 1081',
  FALSE, TRUE, TRUE, TRUE, ARRAY[]::TEXT[], NOW(), NOW()
);

INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "isRG", "informatoryNumber", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags", "createdAt", "updatedAt") VALUES (
  gen_random_uuid()::text, 'STJ', 'Ação indenizatória individual. Programa indenizatório definitivo - PID. Rompimento da barragem do Fundão em Mariana/MG. Requisitos para a indenização. Previsão no acordo de repactuação homologado pelo Supremo Tribunal Federal. Entendimento da Suprema', 'Compete à Justiça Federal - Tribunal Regional Federal da 6ª Região - processar e julgar as demandas que tenham como objeto o Programa Indenizatório Definitivo (PID) relativo ao desastre do rompimento da barragem de Fundão, em Mariana/MG, no contexto da repactuação homologada pelo STF.',
  's-admin', NULL, FALSE, '878',
  'CC', '215.613-MG', '', 'Paulo Sérgio Domingues', NULL,
  FALSE, TRUE, TRUE, TRUE, ARRAY[]::TEXT[], NOW(), NOW()
);

INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "isRG", "informatoryNumber", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags", "createdAt", "updatedAt") VALUES (
  gen_random_uuid()::text, 'STJ', 'Certificado de Entidade Beneficente de Assistência Social (CEBAS). Renovação. Indeferimento. Imunidade tributária. Limites. Lei complementar. Art. 14 do CTN.', 'O pedido de concessão ou renovação de CEBAS deve ser examinado, a princípio, à luz da regra contida no art. 14 do CTN, até que sobrevenha, se for o caso, lei complementar disciplinando de forma diversa a matéria.',
  's-trib', '2026-02-05', FALSE, '878',
  '', '', '', 'Teodoro Silva Santos', NULL,
  FALSE, TRUE, TRUE, TRUE, ARRAY[]::TEXT[], NOW(), NOW()
);

INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "isRG", "informatoryNumber", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags", "createdAt", "updatedAt") VALUES (
  gen_random_uuid()::text, 'STJ', 'Servidor público. Abono de permanência especial. Requerimentos. Efeitos financeiros. Prescrição. Direito provado no segundo pleito. Termo inicial. Definição.', 'Os efeitos financeiros da concessão do abono de permanência especial submetem-se à prescrição quinquenal, contada a partir do requerimento administrativo em que se comprove o direito vindicado.',
  's-admin', '2017-11-14', FALSE, '878',
  'RMS', '65.384-DF', 'Primeira Turma', 'Gurgel de Faria', NULL,
  FALSE, TRUE, TRUE, TRUE, ARRAY[]::TEXT[], NOW(), NOW()
);

INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "isRG", "informatoryNumber", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags", "createdAt", "updatedAt") VALUES (
  gen_random_uuid()::text, 'STJ', 'Contribuição previdenciária patronal. Terço constitucional de férias gozadas. Juízo de retratação. Adaptação à tese vinculante do Supremo Tribunal Federal em Repercussão Geral (Tema n. 985). Modulação de efeitos.', 'Em adequação ao entendimento do Supremo Tribunal Federal, é legítima a incidência de contribuição social, a cargo do empregador, sobre os valores pagos ao empregado a título de terço constitucional de férias gozadas.',
  's-trib', NULL, FALSE, '878',
  'REsp', '1.559.926-RS', 'Segunda Turma', 'Maria Thereza de Assis Moura', NULL,
  FALSE, TRUE, TRUE, TRUE, ARRAY[]::TEXT[], NOW(), NOW()
);

INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "isRG", "informatoryNumber", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags", "createdAt", "updatedAt") VALUES (
  gen_random_uuid()::text, 'STJ', 'Danos morais. Homicídio de adolescente em excursão escolar. Violação do dever contratual de guarda e tutela. Valor da indenização. Extensão do dano. Gravidade da culpa. Capacidade econômica. Parâmetro jurisprudencial meramente orientador. Necessidade', 'No caso de morte de filho decorrente de homicídio, ocorrida enquanto o menor se encontrava sob a guarda de instituição de ensino, o dano moral suportado pelos genitores é presumido ( in re ipsa ), sendo os parâmetros jurisprudenciais para a fixação do quantum indenizatório meramente orientadores e passíveis de adequação às circunstâncias concretas do caso, sobretudo diante de gravidade excepcional do evento.',
  's-civil', '2026-02-03', FALSE, '878',
  '', '', 'Quarta Turma', 'Antonio Carlos Ferreira', NULL,
  FALSE, TRUE, TRUE, TRUE, ARRAY[]::TEXT[], NOW(), NOW()
);

INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "isRG", "informatoryNumber", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags", "createdAt", "updatedAt") VALUES (
  gen_random_uuid()::text, 'STJ', 'Ação regressiva. Transporte aéreo. Roubo de carga. Direitos da seguradora. Transação sem anuência. Ineficácia.', 'A transação dos direitos da seguradora realizada sem a sua participação ou anuência não gera efeitos em relação aos direitos sub-rogados decorrentes do pagamento da indenização securitária.',
  's-civil', NULL, FALSE, '878',
  '', '', 'Quarta Turma', 'Antonio Carlos Ferreira', NULL,
  FALSE, TRUE, TRUE, TRUE, ARRAY[]::TEXT[], NOW(), NOW()
);

INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "isRG", "informatoryNumber", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags", "createdAt", "updatedAt") VALUES (
  gen_random_uuid()::text, 'STJ', 'Ação regressiva. Transporte aéreo. Roubo de carga. Sub-rogação. Direitos do segurado perante o causador do dano. Limite do ressarcimento. Convenção de Montreal. Indenização tarifada. Ausência de declaração especial de valor.', '1. Não se transfere à seguradora sub-rogada mais direitos do que aqueles que a segurada detinha no momento do pagamento da indenização. 2. Somente a declaração especial de valor e o pagamento, quando exigido, de quantia suplementar são capazes de afastar o limite indenizatório previsto no art. 22, item 3, da Convenção de Montreal, não servindo para essa finalidade outros documentos que afirmem o valor da carga transportada.',
  's-civil', '2017-09-19', FALSE, '878',
  '', '', 'Quarta Turma', 'Antonio Carlos Ferreira', NULL,
  FALSE, TRUE, TRUE, TRUE, ARRAY[]::TEXT[], NOW(), NOW()
);

INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "isRG", "informatoryNumber", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags", "createdAt", "updatedAt") VALUES (
  gen_random_uuid()::text, 'STJ', 'Responsabilidade civil objetiva. Infecção hospitalar. Recém-nascido. Sequelas irreversíveis. Reparação integral do dano. Direito ao custeio do tratamento e à pensão vitalícia.', 'Uma vez reconhecido o ato ilícito e a responsabilidade civil, é devida a indenização pelo prejuízo material suportado pela vítima em sua integralidade, em atenção ao princípio da reparação integral.',
  's-civil', '2011-03-01', FALSE, '878',
  '', '', '', 'Marco Buzzi', NULL,
  FALSE, TRUE, TRUE, TRUE, ARRAY[]::TEXT[], NOW(), NOW()
);

INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "isRG", "informatoryNumber", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags", "createdAt", "updatedAt") VALUES (
  gen_random_uuid()::text, 'STJ', 'Seguro de vida em grupo. Invalidez permanente. Doença ocupacional. Equiparação a acidente de trabalho. Impossibilidade. Cláusula de exclusão de cobertura. Validade. Interpretação restritiva.', 'Nos contratos de seguro de vida em grupo, é inviável a equiparação entre doença profissional e acidente de trabalho para o recebimento de indenização securitária, notadamente quando há exclusão de cobertura da invalidez parcial por doença laboral.',
  's-civil', '2023-05-15', FALSE, '878',
  'REsp', '2.206.239-MS', 'Quarta Turma', 'Marco Buzzi', NULL,
  FALSE, TRUE, TRUE, TRUE, ARRAY[]::TEXT[], NOW(), NOW()
);

INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "isRG", "informatoryNumber", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags", "createdAt", "updatedAt") VALUES (
  gen_random_uuid()::text, 'STJ', 'Estelionato previdenciário. Celebração de casamento. Pensão por morte. Benefício previdenciário legalmente instituído. Percepção de vantagem lícita. Ausência de fraude. Atipicidade da conduta.', 'A obtenção de benefício previdenciário, quando não evidenciada fraude no preenchimento dos seus requisitos legais, não caracteriza vantagem indevida para fins de enquadramento típico do crime do art. 171, § 3º, do Código Penal.',
  's-pen', '2025-12-09', FALSE, '878',
  '', '', '', 'Joel Ilan Paciornik', NULL,
  FALSE, TRUE, TRUE, TRUE, ARRAY[]::TEXT[], NOW(), NOW()
);

INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "isRG", "informatoryNumber", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags", "createdAt", "updatedAt") VALUES (
  gen_random_uuid()::text, 'STJ', 'Prisão domiciliar humanitária. Mãe de criança menor de 12 anos. Imprescindibilidade da presença materna não demonstrada. Exigência de prova inequívoca.', 'Exige-se prova inequívoca da imprescindibilidade da presença materna como fundamento da prisão domiciliar, não bastando o mero vínculo familiar com a criança.',
  's-eca', NULL, FALSE, '878',
  '', '', '', 'Carlos Pires Brandão', NULL,
  FALSE, TRUE, FALSE, FALSE, ARRAY[]::TEXT[], NOW(), NOW()
);

INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "isRG", "informatoryNumber", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags", "createdAt", "updatedAt") VALUES (
  gen_random_uuid()::text, 'STJ', 'Prisão preventiva. Decurso relevante de tempo. Indícios de autoria baseados em dados digitais. Necessidade de perícia complementar. Substituição por medidas cautelares diversas. Proporcionalidade.', 'Quando os principais elementos probatórios de autoria consistem em dados digitais cuja fidedignidade necessita de confirmação mediante exame pericial, a proporcionalidade recomenda a substituição da prisão preventiva por medidas cautelares diversas até a conclusão da diligência técnica.',
  's-pproc', NULL, FALSE, '878',
  '', '', '', 'Carlos Pires Brandão', NULL,
  FALSE, TRUE, TRUE, TRUE, ARRAY[]::TEXT[], NOW(), NOW()
);

INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "isRG", "informatoryNumber", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags", "createdAt", "updatedAt") VALUES (
  gen_random_uuid()::text, 'STJ', 'Prova digital. Cadeia de custódia. Ausência de certificação de integridade (código hash). Necessidade de perícia técnica complementar. Necessidade de confirmação da fidedignidade dos elementos probatórios digitais.', 'Havendo dúvida razoável sobre a integridade e autenticidade da prova digital, é necessária a realização de exame pericial para assegurar a confiabilidade do material e o exercício do contraditório.',
  's-pproc', NULL, FALSE, '878',
  '', '', '', 'Carlos Pires Brandão', NULL,
  FALSE, TRUE, TRUE, TRUE, ARRAY[]::TEXT[], NOW(), NOW()
);

-- Total inserido: 14 | Ignorados: 0
SELECT count(*) as total_precedents FROM "precedents";