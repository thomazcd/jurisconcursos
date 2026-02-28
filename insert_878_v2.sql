-- =============================================
-- Informativo STJ 878 – Correção de Datas (Julgamento e Publicação)
-- =============================================

-- IMPORTANTE: Para evitar duplicados, apague os do informativo 878 antes de rodar este
-- DELETE FROM "precedents" WHERE "informatoryNumber" = '878';

-- 1. Remessa necessária (Tema 1081)
INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "publicationDate", "isRG", "informatoryNumber", "informatoryYear", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags", "createdAt", "updatedAt") VALUES (
  gen_random_uuid()::text, 'STJ', 'Remessa necessária. Art. 496, § 3º, I, do CPC/2015. Demandas previdenciárias. Condenação aferível por simples cálculos aritméticos. Liquidez material.', 'A demanda previdenciária cujo valor da condenação seja aferível por simples cálculos aritméticos, com base nos parâmetros fixados na sentença, deve ser dispensada da remessa necessária quando for possível estimar que não excederá o limite previsto no art. 496, § 3º, I, do Código de Processo Civil.',
  's-cproc', '2026-02-04', '2026-02-12', FALSE, '878', 2026,
  'REsp', '1.882.236-RS', 'Corte Especial', 'Og Fernandes', 'Tema 1081',
  FALSE, TRUE, TRUE, TRUE, ARRAY[]::TEXT[], NOW(), NOW()
);

-- 2. Mariana / PID (Caso citado pelo usuário)
INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "publicationDate", "isRG", "informatoryNumber", "informatoryYear", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags", "createdAt", "updatedAt") VALUES (
  gen_random_uuid()::text, 'STJ', 'Ação indenizatória individual. Programa indenizatório definitivo - PID. Rompimento da barragem do Fundão em Mariana/MG.', 'Compete à Justiça Federal - Tribunal Regional Federal da 6ª Região - processar e julgar as demandas que tenham como objeto o Programa Indenizatório Definitivo (PID) relativo ao desastre do rompimento da barragem de Fundão, em Mariana/MG, no contexto da repactuação homologada pelo STF.',
  's-admin', '2026-02-05', '2026-02-10', FALSE, '878', 2026,
  'CC', '215.613-MG', 'Primeira Seção', 'Paulo Sérgio Domingues', NULL,
  FALSE, TRUE, TRUE, TRUE, ARRAY[]::TEXT[], NOW(), NOW()
);

-- 3. CEBAS
INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "publicationDate", "isRG", "informatoryNumber", "informatoryYear", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags", "createdAt", "updatedAt") VALUES (
  gen_random_uuid()::text, 'STJ', 'Certificado de Entidade Beneficente de Assistência Social (CEBAS). Renovação. Indeferimento. Imunidade tributária. CTN.', 'O pedido de concessão ou renovação de CEBAS deve ser examinado, a princípio, à luz da regra contida no art. 14 do CTN, até que sobrevenha, se for o caso, lei complementar disciplinando de forma diversa a matéria.',
  's-trib', '2026-02-05', '2026-02-12', FALSE, '878', 2026,
  '', '', 'Primeira Seção', 'Teodoro Silva Santos', NULL,
  FALSE, TRUE, TRUE, TRUE, ARRAY[]::TEXT[], NOW(), NOW()
);

-- 4. Abono de Permanência Especial (Anotação de correção de data: era 2017 no original)
INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "publicationDate", "isRG", "informatoryNumber", "informatoryYear", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags", "createdAt", "updatedAt") VALUES (
  gen_random_uuid()::text, 'STJ', 'Servidor público. Abono de permanência especial. Efeitos financeiros. Prescrição. Termo inicial.', 'Os efeitos financeiros da concessão do abono de permanência especial submetem-se à prescrição quinquenal, contada a partir do requerimento administrativo em que se comprove o direito vindicado.',
  's-admin', '2026-02-03', '2026-02-12', FALSE, '878', 2026,
  'RMS', '65.384-DF', 'Primeira Turma', 'Gurgel de Faria', NULL,
  FALSE, TRUE, TRUE, TRUE, ARRAY[]::TEXT[], NOW(), NOW()
);

-- 5. Terço constitucional de férias
INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "publicationDate", "isRG", "informatoryNumber", "informatoryYear", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags", "createdAt", "updatedAt") VALUES (
  gen_random_uuid()::text, 'STJ', 'Contribuição previdenciária patronal. Terço constitucional de férias gozadas. Adequação ao Tema 985/STF.', 'Em adequação ao entendimento do Supremo Tribunal Federal, é legítima a incidência de contribuição social, a cargo do empregador, sobre os valores pagos ao empregado a título de terço constitucional de férias gozadas.',
  's-trib', '2026-02-10', '2026-02-13', FALSE, '878', 2026,
  'REsp', '1.559.926-RS', 'Segunda Turma', 'Maria Thereza de Assis Moura', NULL,
  FALSE, TRUE, TRUE, TRUE, ARRAY[]::TEXT[], NOW(), NOW()
);

-- 6. Homicídio Excursão Escolar
INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "publicationDate", "isRG", "informatoryNumber", "informatoryYear", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags", "createdAt", "updatedAt") VALUES (
  gen_random_uuid()::text, 'STJ', 'Danos morais. Homicídio de adolescente em excursão escolar. Valor da indenização. Dano In Re Ipsa.', 'No caso de morte de filho decorrente de homicídio, ocorrida enquanto o menor se encontrava sob a guarda de instituição de ensino, o dano moral suportado pelos genitores é presumido (in re ipsa).',
  's-civil', '2026-02-03', '2026-02-12', FALSE, '878', 2026,
  '', '', 'Quarta Turma', 'Antonio Carlos Ferreira', NULL,
  FALSE, TRUE, TRUE, TRUE, ARRAY[]::TEXT[], NOW(), NOW()
);

-- 7. Ação regressiva Seguro Carga (Ineficácia)
INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "publicationDate", "isRG", "informatoryNumber", "informatoryYear", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags", "createdAt", "updatedAt") VALUES (
  gen_random_uuid()::text, 'STJ', 'Ação regressiva. Transporte aéreo. Roubo de carga. Transação sem anuência da seguradora.', 'A transação dos direitos da seguradora realizada sem a sua participação ou anuência não gera efeitos em relação aos direitos sub-rogados decorrentes do pagamento da indenização securitária.',
  's-civil', '2026-02-03', '2026-02-12', FALSE, '878', 2026,
  '', '', 'Quarta Turma', 'Antonio Carlos Ferreira', NULL,
  FALSE, TRUE, TRUE, TRUE, ARRAY[]::TEXT[], NOW(), NOW()
);

-- 8. Ação regressiva Seguro Carga (Montreal)
INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "publicationDate", "isRG", "informatoryNumber", "informatoryYear", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags", "createdAt", "updatedAt") VALUES (
  gen_random_uuid()::text, 'STJ', 'Ação regressiva. Transporte aéreo. Roubo de carga. Convenção de Montreal. Indenização tarifada.', 'Somente a declaração especial de valor e o pagamento de quantia suplementar são capazes de afastar o limite indenizatório previsto no art. 22, item 3, da Convenção de Montreal.',
  's-civil', '2026-02-03', '2026-02-12', FALSE, '878', 2026,
  '', '', 'Quarta Turma', 'Antonio Carlos Ferreira', NULL,
  FALSE, TRUE, TRUE, TRUE, ARRAY[]::TEXT[], NOW(), NOW()
);

-- 9. Infecção hospitalar
INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "publicationDate", "isRG", "informatoryNumber", "informatoryYear", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags", "createdAt", "updatedAt") VALUES (
  gen_random_uuid()::text, 'STJ', 'Responsabilidade civil objetiva. Infecção hospitalar. Reparação integral do dano.', 'Uma vez reconhecido o ato ilícito e a responsabilidade civil, é devida a indenização pelo prejuízo material suportado pela vítima em sua integralidade, em atenção ao princípio da reparação integral.',
  's-civil', '2026-02-03', '2026-02-12', FALSE, '878', 2026,
  '', '', 'Quarta Turma', 'Marco Buzzi', NULL,
  FALSE, TRUE, TRUE, TRUE, ARRAY[]::TEXT[], NOW(), NOW()
);

-- 10. Seguro de vida Doença Ocupacional
INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "publicationDate", "isRG", "informatoryNumber", "informatoryYear", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags", "createdAt", "updatedAt") VALUES (
  gen_random_uuid()::text, 'STJ', 'Seguro de vida em grupo. Invalidez permanente. Doença ocupacional vs Acidente de trabalho.', 'Nos contratos de seguro de vida em grupo, é inviável a equiparação entre doença profissional e acidente de trabalho para o recebimento de indenização securitária, havendo exclusão de cobertura.',
  's-civil', '2026-02-03', '2026-02-12', FALSE, '878', 2026,
  'REsp', '2.206.239-MS', 'Quarta Turma', 'Marco Buzzi', NULL,
  FALSE, TRUE, TRUE, TRUE, ARRAY[]::TEXT[], NOW(), NOW()
);

-- 11. Estelionato previdenciário
INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "publicationDate", "isRG", "informatoryNumber", "informatoryYear", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags", "createdAt", "updatedAt") VALUES (
  gen_random_uuid()::text, 'STJ', 'Estelionato previdenciário. Celebração de casamento. Ausência de fraude. Atipicidade.', 'A obtenção de benefício previdenciário, quando não evidenciada fraude no preenchimento dos seus requisitos legais (como a celebração de casamento real), não caracteriza vantagem indevida.',
  's-pen', '2026-02-03', '2026-02-12', FALSE, '878', 2026,
  '', '', 'Quinta Turma', 'Joel Ilan Paciornik', NULL,
  FALSE, TRUE, TRUE, TRUE, ARRAY[]::TEXT[], NOW(), NOW()
);

-- 12. Prisão domiciliar humanitária
INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "publicationDate", "isRG", "informatoryNumber", "informatoryYear", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags", "createdAt", "updatedAt") VALUES (
  gen_random_uuid()::text, 'STJ', 'Prisão domiciliar humanitária. Mãe de criança menor de 12 anos. Prova da imprescindibilidade.', 'Exige-se prova inequívoca da imprescindibilidade da presença materna como fundamento da prisão domiciliar, não bastando o mero vínculo familiar com a criança.',
  's-eca', '2026-02-03', '2026-02-12', FALSE, '878', 2026,
  '', '', 'Sexta Turma', 'Carlos Pires Brandão', NULL,
  FALSE, TRUE, FALSE, FALSE, ARRAY[]::TEXT[], NOW(), NOW()
);

-- 13. Prisão preventiva Dados Digitais
INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "publicationDate", "isRG", "informatoryNumber", "informatoryYear", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags", "createdAt", "updatedAt") VALUES (
  gen_random_uuid()::text, 'STJ', 'Prisão preventiva. Dados digitais. Necessidade de perícia complementar. Substituição por cautelares.', 'Quando os principais elementos de autoria consistem em dados digitais cuja fidedignidade necessita de confirmação pericial, recomenda-se a substituição da prisão por medidas cautelares.',
  's-pproc', '2026-02-03', '2026-02-12', FALSE, '878', 2026,
  'HC', '1.014.212', 'Sexta Turma', 'Carlos Pires Brandão', NULL,
  FALSE, TRUE, TRUE, TRUE, ARRAY[]::TEXT[], NOW(), NOW()
);

-- 14. Prova digital integridade (Hash)
INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "publicationDate", "isRG", "informatoryNumber", "informatoryYear", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags", "createdAt", "updatedAt") VALUES (
  gen_random_uuid()::text, 'STJ', 'Prova digital. Cadeia de custódia. Ausência de certificação de integridade (código hash).', 'Havendo dúvida razoável sobre a integridade e autenticidade da prova digital, é necessária a realização de exame pericial para assegurar a confiabilidade do material.',
  's-pproc', '2026-02-03', '2026-02-12', FALSE, '878', 2026,
  'HC', '1.014.212', 'Sexta Turma', 'Carlos Pires Brandão', NULL,
  FALSE, TRUE, TRUE, TRUE, ARRAY[]::TEXT[], NOW(), NOW()
);

SELECT count(*) as total_precedents_878 FROM "precedents" WHERE "informatoryNumber" = '878';
