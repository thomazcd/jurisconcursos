-- ============================================================
-- 🚀 CARGA COMPLETA E DETALHADA - JURIS CONCURSOS
-- Informativos STJ 875, 876, 877 e 878 (CONSOLIDADO TOTAL)
-- ============================================================

-- 1. CRIAÇÃO DE MATÉRIAS (Garante que as categorias existam)
INSERT INTO "subjects" ("id", "name", "trackScope") VALUES
('s-eca',   'ECA',                        'COMMON'),
('s-cons',  'Direito do Consumidor',      'COMMON'),
('s-sau',   'Direito da Saúde',           'COMMON'),
('s-ambi',  'Direito Ambiental',          'COMMON')
ON CONFLICT ("id") DO NOTHING;

-- 2. LIMPEZA PREVENTIVA
DELETE FROM "precedents" WHERE "informatoryNumber" IN ('875', '876', '877', '878') AND "court" = 'STJ';

-- 3. INSERÇÃO DE TODOS OS JULGADOS (DETALHADO)
INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "publicationDate", "isRG", "informatoryNumber", "informatoryYear", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags") VALUES

-- [JULGADOS DO INFORMATIVO 878]
(gen_random_uuid()::text, 'STJ', 'Remessa necessária. CPC/2015. Demandas previdenciárias. Liquidez material.', 'A demanda previdenciária cujo valor da condenação seja aferível por simples cálculos aritméticos, ainda que dependa de pequenos ajustes operacionais, deve ser dispensada da remessa necessária.', 's-cproc', '2026-02-04', '2026-02-12', FALSE, '878', 2026, 'REsp', '1.882.236-RS', 'Corte Especial', 'Og Fernandes', 'Tema 1081', FALSE, TRUE, TRUE, TRUE, ARRAY['remessa necessária', 'previdenciário']),
(gen_random_uuid()::text, 'STJ', 'Ação indenizatória individual. Mariana/MG. Competência TRF6.', 'Compete à Justiça Federal (TRF6) processar e julgar as demandas que tenham como objeto o Programa Indenizatório Definitivo (PID) relativo ao desastre de Mariana.', 's-admin', '2026-02-05', '2026-02-10', FALSE, '878', 2026, 'CC', '215.613-MG', 'Primeira Seção', 'Paulo Sérgio Domingues', NULL, FALSE, TRUE, TRUE, TRUE, ARRAY['competência', 'Mariana']),
(gen_random_uuid()::text, 'STJ', 'Crédito tributário. Penhora. Substituição por fiança bancária.', 'É possível a substituição de penhora por fiança bancária ou seguro garantia em execução fiscal, sem a necessidade de comprovação de urgência ou risco.', 's-trib', '2026-02-11', NULL, FALSE, '878', 2026, 'REsp', '2.145.789-SP', 'Primeira Seção', 'Gurgel de Faria', 'Tema 1385', FALSE, TRUE, TRUE, TRUE, ARRAY['tributário', 'fiança bancária']),

-- [JULGADOS DO INFORMATIVO 877]
(gen_random_uuid()::text, 'STJ', 'Execução fiscal. Penhora. Fiança bancária e seguro garantia.', 'Na execução fiscal, a fiança bancária ou o seguro garantia oferecido em garantia de execução de crédito tributário não é recusável por inobservância à ordem legal da penhora.', 's-cproc', '2026-02-11', NULL, FALSE, '877', 2026, 'REsp', '2.193.673-SC', 'Primeira Seção', 'Maria Thereza de Assis Moura', 'Tema 1385', FALSE, TRUE, TRUE, TRUE, ARRAY['execução fiscal', 'penhora']),
(gen_random_uuid()::text, 'STJ', 'Contribuições a terceiros. Limite de 20 salários mínimos. Inaplicabilidade.', 'A base de cálculo das contribuições ao INCRA, salário-educação, SEBRAE, etc., não é limitada a 20 vezes o maior salário-mínimo vigente no país.', 's-trib', '2026-02-11', NULL, FALSE, '877', 2026, 'REsp', '2.187.625-RJ', 'Primeira Seção', 'Maria Thereza de Assis Moura', 'Tema 1390', FALSE, TRUE, TRUE, TRUE, ARRAY['tributário', 'contribuições a terceiros']),
(gen_random_uuid()::text, 'STJ', 'Conflito de competência. Liquidação individual de ACP. Domicílio.', 'Na execução individual de sentença coletiva contra pessoa jurídica, considera-se domicílio do executado o local da unidade em que foi celebrado o negócio jurídico.', 's-cproc', '2026-02-05', '2026-02-12', FALSE, '877', 2026, 'CC', '216.258-DF', 'Segunda Seção', 'Nancy Andrighi', NULL, FALSE, TRUE, TRUE, TRUE, ARRAY['competência', 'ACP']),
(gen_random_uuid()::text, 'STJ', 'PAD. Prova penal emprestada ilícita. Inadmissibilidade.', 'É inadmissível a condenação em processo administrativo disciplinar amparada em prova penal emprestada considerada ilícita pelo STJ.', 's-admin', '2025-12-10', '2025-12-23', FALSE, '877', 2026, 'Rcl', '47.632-DF', 'Terceira Seção', 'Reynaldo Soares da Fonseca', NULL, FALSE, TRUE, TRUE, TRUE, ARRAY['PAD', 'prova emprestada']),
(gen_random_uuid()::text, 'STJ', 'Corrupção ativa. Folha de respostas da OAB. Documento público.', 'A folha de respostas do Exame de Ordem da OAB é considerada documento público para fins penais.', 's-pen', '2025-12-16', '2025-12-24', FALSE, '877', 2026, 'REsp', '1.977.628-GO', 'Quinta Turma', 'Ribeiro Dantas', NULL, FALSE, TRUE, TRUE, TRUE, ARRAY['penal', 'corrupção', 'OAB']),

-- [JULGADOS DO INFORMATIVO 876]
(gen_random_uuid()::text, 'STJ', 'Homologação de decisão estrangeira. Testamento. Competência nacional.', 'A homologação de ato notarial estrangeiro sobre bens no Brasil contraria o art. 964 do CPC, dada a competência exclusiva da jurisdição nacional.', 's-cproc', '2025-11-11', '2025-11-18', FALSE, '876', 2026, '', '', 'Corte Especial', 'Og Fernandes', NULL, FALSE, TRUE, TRUE, TRUE, ARRAY['civil', 'internacional']),
(gen_random_uuid()::text, 'STJ', 'Improbidade. Tortura. Atipicidade na Lei 14.230/2021.', 'As modificações da Lei 14.230/2021 não permitem mais qualificar a prática de tortura como ato de improbidade administrativa por atentado aos princípios.', 's-admin', '2026-02-03', NULL, FALSE, '876', 2026, 'REsp', '2.232.623-AL', 'Primeira Turma', 'Regina Helena Costa', NULL, FALSE, TRUE, TRUE, TRUE, ARRAY['improbidade', 'tortura']),
(gen_random_uuid()::text, 'STJ', 'IRPF. Rescisão unilateral cível. Verbas indenizatórias.', 'O IRPF incide sobre verbas de PLR, bônus e stock options pagas em rescisão unilateral de contrato de natureza cível.', 's-trib', '2026-02-03', NULL, FALSE, '876', 2026, 'REsp', '1.409.762-SP', 'Segunda Turma', 'Maria Thereza de Assis Moura', NULL, FALSE, TRUE, TRUE, TRUE, ARRAY['tributário', 'IRPF']),
(gen_random_uuid()::text, 'STJ', 'Consumidor. Preço único à vista e a prazo. Validade.', 'A liberdade de precificação permite manter o mesmo preço para vendas à vista e a prazo, inexistindo abusividade automática.', 's-cons', '2026-02-03', NULL, FALSE, '876', 2026, 'REsp', '1.876.423-SP', 'Quarta Turma', 'Marco Buzzi', NULL, FALSE, TRUE, TRUE, TRUE, ARRAY['consumidor', 'preço']),

-- [JULGADOS DO INFORMATIVO 875]
(gen_random_uuid()::text, 'STJ', 'Honorários. Embargos à execução fiscal. Adesão a REFIS.', 'A extinção dos embargos em face da adesão a programa de recuperação fiscal já com honorários administrativos impede nova condenação judicial.', 's-cproc', '2025-11-12', '2025-12-24', FALSE, '875', 2026, 'REsp', '2.158.358-MG', 'Primeira Seção', 'Gurgel de Faria', 'Tema 1317', FALSE, TRUE, TRUE, TRUE, ARRAY['honorários', 'REFIS']),
(gen_random_uuid()::text, 'STJ', 'Impenhorabilidade. Pequena propriedade rural. Hipoteca.', 'É aplicável a proteção da impenhorabilidade de pequena propriedade rural mesmo que oferecida em garantia em alienação fiduciária.', 's-civil', '2025-12-09', '2025-12-15', FALSE, '875', 2026, 'REsp', '2.233.886-RS', 'Terceira Turma', 'Nancy Andrighi', NULL, FALSE, TRUE, TRUE, TRUE, ARRAY['civil', 'impenhorabilidade']),
(gen_random_uuid()::text, 'STJ', 'Plano de saúde. Método TREINI. Cobertura obrigatória.', 'É obrigatória a cobertura de tratamentos multidisciplinares (método TREINI) para beneficiários diagnosticados com transtornos globais.', 's-sau', '2025-11-24', '2025-11-27', FALSE, '875', 2026, 'REsp', '2.221.399-SP', 'Terceira Turma', 'Nancy Andrighi', NULL, FALSE, TRUE, TRUE, TRUE, ARRAY['saúde', 'plano de saúde']);

-- 4. CONTAGEM FINAL PARA CONFERÊNCIA
SELECT "informatoryNumber", count(*) FROM "precedents" WHERE "informatoryNumber" IN ('875', '876', '877', '878') GROUP BY "informatoryNumber";
