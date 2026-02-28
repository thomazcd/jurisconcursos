-- ============================================================
-- 🚀 CARGA CONSOLIDADA - JURIS CONCURSOS (V1.00045)
-- Informativos STJ 875, 876, 877 e 878 (Totalmente Corrigidos)
-- ============================================================

-- 1. ADIÇÃO DE MATÉRIAS FALTANTES
INSERT INTO "subjects" ("id", "name", "trackScope") VALUES
('s-eca',   'ECA',                        'COMMON'),
('s-cons',  'Direito do Consumidor',      'COMMON'),
('s-sau',   'Direito da Saúde',           'COMMON'),
('s-ambi',  'Direito Ambiental',          'COMMON')
ON CONFLICT ("id") DO NOTHING;

-- 2. LIMPEZA PREVENTIVA (Evita duplicados)
DELETE FROM "precedents" WHERE "informatoryNumber" IN ('875', '876', '877', '878') AND "court" = 'STJ';

-- 3. INSERÇÃO DOS JULGADOS
INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "publicationDate", "isRG", "informatoryNumber", "informatoryYear", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags") VALUES

-- [INFORMATIVO 878]
(gen_random_uuid()::text, 'STJ', 'Remessa necessária. CPC/2015. Demandas previdenciárias. Liquidez material.', 'A demanda previdenciária cujo valor da condenação seja aferível por simples cálculos aritméticos deve ser dispensada da remessa necessária.', 's-cproc', '2026-02-04', '2026-02-12', FALSE, '878', 2026, 'REsp', '1.882.236-RS', 'Corte Especial', 'Og Fernandes', 'Tema 1081', FALSE, TRUE, TRUE, TRUE, ARRAY['remessa necessária', 'previdenciário']),
(gen_random_uuid()::text, 'STJ', 'Ação indenizatória individual. Mariana/MG. Competência TRF6.', 'Compete à Justiça Federal (TRF6) processar e julgar as demandas que tenham como objeto o Programa Indenizatório Definitivo (PID).', 's-admin', '2026-02-05', '2026-02-10', FALSE, '878', 2026, 'CC', '215.613-MG', 'Primeira Seção', 'Paulo Sérgio Domingues', NULL, FALSE, TRUE, TRUE, TRUE, ARRAY['competência', 'Mariana']),

-- [INFORMATIVO 877]
(gen_random_uuid()::text, 'STJ', 'Execução fiscal. Fiança bancária e seguro garantia. Recusa.', 'Na execução fiscal, a fiança bancária ou o seguro garantia não é recusável por inobservância à ordem legal da penhora.', 's-cproc', '2026-02-11', NULL, FALSE, '877', 2026, 'REsp', '2.193.673-SC', 'Primeira Seção', 'Maria Thereza de Assis Moura', 'Tema 1385', FALSE, TRUE, TRUE, TRUE, ARRAY['execução fiscal', 'penhora']),
(gen_random_uuid()::text, 'STJ', 'Conflito de competência. Liquidação individual de ACP. Domicílio.', 'Considera-se domicílio do executado o local da unidade em que foi celebrado o negócio jurídico.', 's-cproc', '2026-02-05', '2026-02-12', FALSE, '877', 2026, 'CC', '216.258-DF', 'Segunda Seção', 'Nancy Andrighi', NULL, FALSE, TRUE, TRUE, TRUE, ARRAY['competência', 'ACP']),
(gen_random_uuid()::text, 'STJ', 'Licitações. Retroatividade da Lei 14.133/2021.', 'Inadequado aplicar retroativamente sanções da Lei 14.133/2021 para ilícitos anteriores à sua vigência plena.', 's-lici', '2026-02-10', NULL, FALSE, '877', 2026, 'REsp', '2.211.999-SP', 'Primeira Turma', 'Regina Helena Costa', NULL, FALSE, TRUE, TRUE, TRUE, ARRAY['licitações', 'retroatividade']),

-- [INFORMATIVO 876]
(gen_random_uuid()::text, 'STJ', 'Homologação de decisão estrangeira. Testamento. Bens no Brasil.', 'Inviável homologação de ato estrangeiro sobre partilha de bens situados no Brasil (art. 964 CPC).', 's-cproc', '2025-11-11', '2025-11-18', FALSE, '876', 2026, '', '', 'Corte Especial', 'Og Fernandes', NULL, FALSE, TRUE, TRUE, TRUE, ARRAY['internacional', 'testamento']),
(gen_random_uuid()::text, 'STJ', 'Improbidade. Tortura. Atipicidade na Lei 14.230/2021.', 'Lei 14.230/2021 não permite mais qualificar tortura como ato de improbidade por atentado aos princípios.', 's-admin', '2026-02-03', NULL, FALSE, '876', 2026, 'REsp', '2.232.623-AL', 'Primeira Turma', 'Regina Helena Costa', NULL, FALSE, TRUE, TRUE, TRUE, ARRAY['improbidade', 'tortura']),
(gen_random_uuid()::text, 'STJ', 'Seguro de vida. Suicídio no prazo bienal.', 'Apenas o suicídio ocorrido nos dois primeiros anos autoriza exclusão de cobertura securitária.', 's-civil', '2025-12-16', '2026-01-14', FALSE, '876', 2026, 'REsp', '2.130.908-SP', 'Quarta Turma', 'Antonio Carlos Ferreira', NULL, FALSE, TRUE, TRUE, TRUE, ARRAY['civil', 'suicídio']),

-- [INFORMATIVO 875]
(gen_random_uuid()::text, 'STJ', 'Honorários. Embargos à execução. REFIS.', 'Adesão a REFIS com honorários administrativos impede nova condenação em honorários judiciais nos embargos.', 's-cproc', '2025-11-12', '2025-12-24', FALSE, '875', 2026, 'REsp', '2.158.358-MG', 'Primeira Seção', 'Gurgel de Faria', 'Tema 1317', FALSE, TRUE, TRUE, TRUE, ARRAY['honorários', 'REFIS']),
(gen_random_uuid()::text, 'STJ', 'Impenhorabilidade. Pequena propriedade rural. Alienação fiduciária.', 'Proteção da impenhorabilidade é oponível mesmo em garantia fiduciária de pequena propriedade rural.', 's-civil', '2025-12-09', '2025-12-15', FALSE, '875', 2026, 'REsp', '2.233.886-RS', 'Terceira Turma', 'Nancy Andrighi', NULL, FALSE, TRUE, TRUE, TRUE, ARRAY['civil', 'impenhorabilidade']);

-- 4. VALIDAÇÃO FINAL
SELECT "informatoryNumber", count(*) FROM "precedents" WHERE "informatoryNumber" IN ('875', '876', '877', '878') GROUP BY "informatoryNumber";
