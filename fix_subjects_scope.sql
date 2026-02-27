-- =============================================
-- CORREÇÃO DOS ESCOPOS DAS MATÉRIAS
-- Execute no SQL Editor do Supabase
-- =============================================

-- 1. Zera todos os booleans primeiro (evita acúmulo de dados errôneos)
UPDATE "subjects" SET
    "forJuizEstadual" = FALSE,
    "forJuizFederal"  = FALSE,
    "forProcurador"   = FALSE;

-- =============================================
-- COMUNS AOS 3 (aparecem para todos)
-- =============================================
UPDATE "subjects" SET "forJuizEstadual" = TRUE, "forJuizFederal" = TRUE, "forProcurador" = TRUE
WHERE name IN (
    'Direito Constitucional',
    'Direito Civil',
    'Direito Processual Civil',
    'Direito Penal',
    'Direito Processual Penal',
    'Direito Tributário',
    'Direito Administrativo',
    'Direito Ambiental',
    'Direito Empresarial',
    'Noções Gerais de Direito e Formação Humanística',
    'Direitos Humanos',
    'Direito do Consumidor'
);

-- =============================================
-- SÓ JUIZ ESTADUAL
-- =============================================
UPDATE "subjects" SET "forJuizEstadual" = TRUE
WHERE name IN (
    'Direito da Criança e do Adolescente',
    'Direito Eleitoral'
);

-- =============================================
-- SÓ JUIZ FEDERAL
-- =============================================
UPDATE "subjects" SET "forJuizFederal" = TRUE
WHERE name IN (
    'Direito Econômico',
    'Direito Internacional Público e Privado',
    'Direito Internacional Público',
    'Direito Internacional Privado'
);

-- =============================================
-- JUIZ FEDERAL + PROCURADOR (não estadual)
-- =============================================
UPDATE "subjects" SET "forJuizFederal" = TRUE, "forProcurador" = TRUE
WHERE name IN (
    'Direito Previdenciário',
    'Direito Financeiro'
);

-- =============================================
-- SÓ PROCURADOR
-- =============================================
-- (Adicione aqui matérias exclusivas de procurador, se houver)

-- =============================================
-- Verificação final
-- =============================================
SELECT name, "forJuizEstadual", "forJuizFederal", "forProcurador"
FROM "subjects"
ORDER BY name;
