-- =============================================
-- MIGRAÇÃO: Adicionar campos novos ao schema
-- Execute no SQL Editor do Supabase
-- =============================================

-- 1. Adicionar campo TEMA no precedentes
ALTER TABLE "precedents" ADD COLUMN IF NOT EXISTS "theme" TEXT;

-- 2. Alterar PrecedentRead: remover readAt, adicionar readCount + readEvents + updatedAt
ALTER TABLE "precedent_reads"
    ADD COLUMN IF NOT EXISTS "readCount" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "readEvents" TIMESTAMP WITH TIME ZONE[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();

-- Verifica se readAt existe antes de remover (seguro)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'precedent_reads' AND column_name = 'readAt') THEN
        ALTER TABLE "precedent_reads" DROP COLUMN "readAt";
    END IF;
END $$;

-- Confirmação
SELECT 'Migração concluída! Verifique os resultados abaixo.' as status;
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name IN ('precedents', 'precedent_reads')
ORDER BY table_name, ordinal_position;
