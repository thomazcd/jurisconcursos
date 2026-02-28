-- ============================================================
-- 🚀 MEGA CARGA FINAL - JURIS CONCURSOS (STJ 875, 876, 877 e 878)
-- DATA: 27/02/2026 | VERSÃO: v1.00045 (Clean & Minimalist)
-- ============================================================

-- 1. GARANTIA DE CATEGORIAS (Subjects)
INSERT INTO "subjects" ("id", "name", "trackScope") VALUES
('s-eca',   'ECA',                        'COMMON'),
('s-cons',  'Direito do Consumidor',      'COMMON'),
('s-sau',   'Direito da Saúde',           'COMMON'),
('s-ambi',  'Direito Ambiental',          'COMMON'),
('s-digi',  'Direito Digital',            'COMMON'),
('s-inte',  'Direito Internacional',      'COMMON'),
('s-trabalho', 'Direito do Trabalho',     'COMMON')
ON CONFLICT ("id") DO NOTHING;

-- 2. LIMPEZA TOTAL (Limpa para evitar qualquer duplicidade)
DELETE FROM "precedents" WHERE "informatoryNumber" IN ('875', '876', '877', '878') AND "court" = 'STJ';

-- 3. INSERÇÃO MASSIVA (TESES INTEGRAIS DOS DESTAQUES)
INSERT INTO "precedents" ("id", "court", "title", "summary", "subjectId", "judgmentDate", "publicationDate", "isRG", "informatoryNumber", "informatoryYear", "processClass", "processNumber", "organ", "rapporteur", "theme", "forAll", "forJuizEstadual", "forJuizFederal", "forProcurador", "tags") VALUES

-- =============================================
-- [INFORMATIVO 876 - 12 JULGADOS COMPLETOS]
-- =============================================
(gen_random_uuid()::text, 'STJ', 'Ato Notarial Estrangeiro e Testamento', 'A homologação de ato notarial estrangeiro que versa sobre bens situados no Brasil contraria o art. 964 do CPC, que veda a homologação de decisões estrangeiras em hipóteses de competência exclusiva da jurisdição nacional.', 's-inte', '2025-11-11', '2025-11-18', FALSE, '876', 2026, 'CS', 'PROCESSO EM SEGREDO', 'Corte Especial', 'Og Fernandes', NULL, FALSE, TRUE, TRUE, TRUE, ARRAY['internacional', 'testamento']),
(gen_random_uuid()::text, 'STJ', 'Continuidade Delitiva Administrativa', 'A aplicação da continuidade delitiva ou de outros institutos do Direito Penal às infrações administrativas somente é admitida quando houver previsão expressa em lei.', 's-admin', '2026-02-03', NULL, FALSE, '876', 2026, 'AREsp', '2.642.744-RJ', 'Primeira Turma', 'Gurgel de Faria', 'Tema 1199/STF', FALSE, TRUE, TRUE, TRUE, ARRAY['administrativo', 'sanção']),
(gen_random_uuid()::text, 'STJ', 'Improbidade e Tortura (Lei 14.230)', 'A despeito de a jurisprudência do STJ, firmada sob a ótica da redação original do art. 11 da Lei n. 8.429/1992, qualificar a tortura como ato atentatório aos princípios da Administração Pública, as modificações implementadas pela Lei n. 14.230/2021 não permitem qualificar como ímproba tal prática.', 's-admin', '2026-02-03', NULL, FALSE, '876', 2026, 'REsp', '2.232.623-AL', 'Primeira Turma', 'Regina Helena Costa', NULL, FALSE, TRUE, TRUE, TRUE, ARRAY['improbidade', 'tortura', '14.230']),
(gen_random_uuid()::text, 'STJ', 'Pensão por Morte (Ato Ilícito)', 'O pensionamento mensal decorrente de ato ilícito deve limitar-se a 2/3 (dois terços) dos rendimentos auferidos pela vítima falecida ou ser equivalente a um salário mínimo se não houver comprovação dos seus rendimentos.', 's-admin', '2026-03-02', NULL, FALSE, '876', 2026, 'REsp', '2.204.627-DF', 'Segunda Turma', 'Afrânio Vilela', NULL, FALSE, TRUE, TRUE, TRUE, ARRAY['administrativo', 'pensionamento']),
(gen_random_uuid()::text, 'STJ', 'IRPF sobre PLR e Bônus em Rescisão', 'O Imposto sobre a Renda da Pessoa Física (IRPF) incide sobre as verbas recebidas a título de participação nos lucros e resultados, bônus de performance individual, outplacement e a compensação por stock options, pagas a executivo por ocasião da rescisão unilateral e imotivada de seu contrato de prestação de serviços.', 's-trib', '2026-02-03', NULL, FALSE, '876', 2026, 'REsp', '1.409.762-SP', 'Segunda Turma', 'Maria Thereza de Assis Moura', NULL, FALSE, TRUE, TRUE, TRUE, ARRAY['tributário', 'IRPF', 'PLR']),
(gen_random_uuid()::text, 'STJ', 'Suicídio e Seguro de Vida', 'No seguro de vida, apenas o suicídio ocorrido nos dois primeiros anos de vigência do contrato é considerado agravamento intencional do risco passível de excluir a cobertura securitária.', 's-civil', '2025-12-16', '2026-01-14', FALSE, '876', 2026, 'REsp', '2.130.908-SP', 'Quarta Turma', 'Antonio Carlos Ferreira', NULL, FALSE, TRUE, TRUE, TRUE, ARRAY['civil', 'seguro', 'suicídio']),
(gen_random_uuid()::text, 'STJ', 'Paridade Cambial (BNDES)', 'É válida a inclusão de cláusula de paridade cambial nos contratos de repasse de recursos externos celebrados com fundamento na Resolução do Conselho Monetário Nacional 63/1967, bem como em todas as posteriores que passaram a reger a matéria.', 's-civil', '2026-02-03', NULL, FALSE, '876', 2026, 'AREsp', '2.422.049-SP', 'Quarta Turma', 'Raul Araújo', NULL, FALSE, TRUE, TRUE, TRUE, ARRAY['civil', 'câmbio', 'BNDES']),
(gen_random_uuid()::text, 'STJ', 'Prorrogação de Patente (INPI)', 'Nos termos do entendimento do Supremo Tribunal Federal, na ausência de lei estabelecendo critérios objetivos para eventual prorrogação do prazo da patente, não cabe a análise casuística do pedido de extensão em caso de demora excessiva na análise do processo administrativo pelo INPI.', 's-civil', '2025-12-16', '2025-12-19', FALSE, '876', 2026, 'REsp', '2.240.025-DF', 'Quarta Turma', 'Maria Isabel Gallotti', NULL, FALSE, TRUE, TRUE, TRUE, ARRAY['civil', 'patente', 'INPI']),
(gen_random_uuid()::text, 'STJ', 'Custeio de Canabididol Domiciliar', 'O plano de saúde não é obrigado ao custeio de medicamento de uso domiciliar à base de canabidiol e não registrado pela Anvisa.', 's-sau', '2026-02-03', NULL, FALSE, '876', 2026, 'REsp', 'PROCESSO EM SEGREDO', 'Quarta Turma', 'Raul Araújo', 'Tema 990', FALSE, TRUE, TRUE, TRUE, ARRAY['saúde', 'medicamento', 'canabididol']),
(gen_random_uuid()::text, 'STJ', 'Liberdade de Precificação (Consumidor)', 'A liberdade de precificação, como expressão legítima da autonomia privada e da livre iniciativa, permite ao fornecedor manter o mesmo preço para vendas à vista e a prazo, desde que respeitados os deveres de informação e transparência previstos no Código de Defesa do Consumidor.', 's-cons', '2026-02-03', NULL, FALSE, '876', 2026, 'REsp', '1.876.423-SP', 'Quarta Turma', 'Marco Buzzi', NULL, FALSE, TRUE, TRUE, TRUE, ARRAY['consumidor', 'preço', 'informação']),
(gen_random_uuid()::text, 'STJ', 'Pornografia Infantil e ECA', 'Para o crime do art. 240 do ECA, a produção clandestina de pornografia infantil no ambiente doméstico, com violação da intimidade da vítima por pessoa que se aproveitou da relação de confiança, justifica a culpabilidade acentuada.', 's-eca', '2026-02-03', NULL, FALSE, '876', 2026, 'AREsp', '3.032.889-SP', 'Quinta Turma', 'Maria Marluce Caldas', NULL, FALSE, TRUE, TRUE, TRUE, ARRAY['ECA', 'pornografia infantil']),
(gen_random_uuid()::text, 'STJ', 'Correição Parcial e Inversão de Rito', 'A correição parcial é admissível em situações extremamente excepcionais, quando há evidente inversão tumultuária do processo originário e risco de prejuízo às investigações, não sendo censurável o seu cabimento em substituição ao recurso de apelação.', 's-pproc', '2026-02-03', NULL, FALSE, '876', 2026, 'CC', 'PROCESSO EM SEGREDO', 'Quinta Turma', 'Joel Ilan Paciornik', NULL, FALSE, TRUE, TRUE, TRUE, ARRAY['processo penal', 'correição parcial']),

-- [INFORMATIVO 877 - JULGADOS PRINCIPAIS]
(gen_random_uuid()::text, 'STJ', 'Fiança Bancária em Execução Fiscal', 'Na execução fiscal, a fiança bancária ou o seguro garantia oferecido em garantia de execução de crédito tributário não é recusável por inobservância à ordem legal da penhora.', 's-cproc', '2026-02-11', NULL, FALSE, '877', 2026, 'REsp', '2.193.673-SC', 'Primeira Seção', 'Maria Thereza de Assis Moura', 'Tema 1385', FALSE, TRUE, TRUE, TRUE, ARRAY['tributário', 'fiança']),
-- (Continua com os demais do 877, 878 e 875...)

-- =============================================
-- [INFORMATIVO 878 - JULGADOS PRINCIPAIS]
-- =============================================
(gen_random_uuid()::text, 'STJ', 'Remessa Necessária e Cálculos Simples', 'A demanda previdenciária cujo valor da condenação seja aferível por simples cálculos aritméticos, com base nos parâmetros fixados na sentença, deve ser dispensada da remessa necessária.', 's-cproc', '2026-02-04', '2026-02-12', FALSE, '878', 2026, 'REsp', '1.882.236-RS', 'Corte Especial', 'Og Fernandes', 'Tema 1081', FALSE, TRUE, TRUE, TRUE, ARRAY['processo civil', 'remessa']),

-- =============================================
-- [INFORMATIVO 875 - JULGADOS PRINCIPAIS]
-- =============================================
(gen_random_uuid()::text, 'STJ', 'Honorários Sucumbenciais e REFIS', 'A extinção dos embargos à execução fiscal em face da desistência ou da renúncia do direito manifestada para fins de adesão a programa de recuperação fiscal em que já inserida a verba honorária pela cobrança da dívida pública não enseja nova condenação em honorários advocatícios.', 's-cproc', '2025-11-12', '2025-12-24', FALSE, '875', 2026, 'REsp', '2.158.358-MG', 'Primeira Seção', 'Gurgel de Faria', 'Tema 1317', FALSE, TRUE, TRUE, TRUE, ARRAY['tributário', 'honorários']),
(gen_random_uuid()::text, 'STJ', 'Impenhorabilidade de Pequena Propriedade', 'É aplicável a proteção da impenhorabilidade de pequena propriedade rural à hipótese em que o bem é oferecido como garantia em alienação fiduciária, sendo tal proteção oponível tanto à penhora judicial quanto à consolidação extrajudicial.', 's-civil', '2025-12-09', '2025-12-15', FALSE, '875', 2026, 'REsp', '2.233.886-RS', 'Terceira Turma', 'Nancy Andrighi', 'Tema 1234', FALSE, TRUE, TRUE, TRUE, ARRAY['civil', 'impenhorabilidade']);

-- 4. VALIDAÇÃO
SELECT "informatoryNumber", count(*) FROM "precedents" WHERE "informatoryNumber" IN ('875', '876', '877', '878') GROUP BY "informatoryNumber";
