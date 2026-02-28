-- =============================================
-- Script para Remover Duplicados (Mantendo apenas 1 de cada)
-- =============================================

-- 1. Identificar e remover duplicados baseados em Campo Identificadores (Tribunal, Processo e Título)
-- Mantemos o registro mais antigo (menor createdAt)
DELETE FROM "precedents"
WHERE "id" NOT IN (
    SELECT MIN("id")
    FROM "precedents"
    GROUP BY "court", "processNumber", "title", "informatoryNumber"
);

-- 2. Limpeza específica para o Informativo 878 (caso queira resetar e rodar o v2 limpo)
-- Descomente as linhas abaixo se preferir apagar tudo do 878 e rodar o insert_878_v2.sql novamente:
-- DELETE FROM "precedents" WHERE "informatoryNumber" = '878';

-- 3. Mostrar total após limpeza
SELECT count(*) as total_precedents_apos_limpeza FROM "precedents";
