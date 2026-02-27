-- ============================================================
-- MIGRAÇÃO v2 – Juris Concursos
-- Execute inteiro no Supabase SQL Editor
-- ============================================================

-- 1. CRIAR NOVOS TIPOS (ENUMS)
DO $$ BEGIN CREATE TYPE "Role" AS ENUM ('ADMIN','GESTOR','USER');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "Track" AS ENUM ('PROCURADOR','JUIZ_FEDERAL','JUIZ_ESTADUAL');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "TrackScope" AS ENUM ('COMMON','PROCURADOR','JUIZ_FEDERAL','JUIZ_ESTADUAL');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "Court" AS ENUM ('STF','STJ','TRF','TJ');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. RECRIAR TABELAS
DROP TABLE IF EXISTS "precedent_reads" CASCADE;
DROP TABLE IF EXISTS "precedents" CASCADE;
DROP TABLE IF EXISTS "user_profiles" CASCADE;
DROP TABLE IF EXISTS "subjects" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

CREATE TABLE "users" (
  "id"           TEXT   PRIMARY KEY,
  "name"         TEXT   NOT NULL,
  "email"        TEXT   NOT NULL UNIQUE,
  "passwordHash" TEXT   NOT NULL,
  "role"         "Role" NOT NULL DEFAULT 'USER',
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "user_profiles" (
  "id"          TEXT    PRIMARY KEY,
  "userId"      TEXT    NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "activeTrack" "Track" NOT NULL DEFAULT 'JUIZ_ESTADUAL',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "subjects" (
  "id"         TEXT         PRIMARY KEY,
  "name"       TEXT         NOT NULL,
  "trackScope" "TrackScope" NOT NULL DEFAULT 'COMMON',
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "precedents" (
  "id"                TEXT    PRIMARY KEY,
  "court"             "Court" NOT NULL,
  "title"             TEXT    NOT NULL,
  "summary"           TEXT    NOT NULL,
  "fullTextOrLink"    TEXT,
  "forAll"            BOOLEAN NOT NULL DEFAULT TRUE,
  "forProcurador"     BOOLEAN NOT NULL DEFAULT FALSE,
  "forJuizFederal"    BOOLEAN NOT NULL DEFAULT FALSE,
  "forJuizEstadual"   BOOLEAN NOT NULL DEFAULT FALSE,
  "subjectId"         TEXT    NOT NULL REFERENCES "subjects"("id") ON DELETE RESTRICT,
  "judgmentDate"      TIMESTAMP(3),
  "isRG"              BOOLEAN NOT NULL DEFAULT FALSE,
  "rgTheme"           INTEGER,
  "informatoryNumber" TEXT,
  "processClass"      TEXT,
  "processNumber"     TEXT,
  "organ"             TEXT,
  "rapporteur"        TEXT,
  "tags"              TEXT[]  NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "precedent_reads" (
  "userId"      TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "precedentId" TEXT NOT NULL REFERENCES "precedents"("id") ON DELETE CASCADE,
  "readAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("userId","precedentId")
);

-- 3. MATÉRIAS
-- COMUNS (aparecem para todos)
INSERT INTO "subjects" ("id","name","trackScope") VALUES
('s-const',  'Direito Constitucional',                        'COMMON'),
('s-admin',  'Direito Administrativo',                        'COMMON'),
('s-civil',  'Direito Civil',                                 'COMMON'),
('s-trib',   'Direito Tributário',                            'COMMON'),
('s-pen',    'Direito Penal',                                 'COMMON'),
('s-pproc',  'Direito Processual Penal',                      'COMMON'),
('s-cproc',  'Direito Processual Civil',                      'COMMON'),
-- PROCURADOR
('s-fin',    'Direito Financeiro',                            'PROCURADOR'),
('s-resp',   'Responsabilidade Civil',                        'PROCURADOR'),
('s-lici',   'Licitações e Contratos',                        'PROCURADOR'),
('s-impr',   'Improbidade Administrativa',                    'PROCURADOR'),
-- JUIZ FEDERAL
('s-prev',   'Direito Previdenciário',                        'JUIZ_FEDERAL'),
('s-econ',   'Direito Econômico e Proteção ao Consumidor',    'JUIZ_FEDERAL'),
('s-empr',   'Direito Empresarial',                           'JUIZ_FEDERAL'),
('s-ambi',   'Direito Ambiental',                             'JUIZ_FEDERAL'),
('s-intpub', 'Direito Internacional Público',                 'JUIZ_FEDERAL'),
('s-intprv', 'Direito Internacional Privado',                 'JUIZ_FEDERAL'),
('s-hum',    'Direitos Humanos',                              'JUIZ_FEDERAL'),
('s-form',   'Noções Gerais de Direito e Formação Humanística','JUIZ_FEDERAL'),
-- JUIZ ESTADUAL
('s-exec',   'Execução Civil',                                'JUIZ_ESTADUAL'),
('s-etic',   'Ética Judicial',                                'JUIZ_ESTADUAL'),
('s-jspec',  'Juizados Especiais',                            'JUIZ_ESTADUAL'),
('s-fam',    'Direito de Família e Sucessões',                'JUIZ_ESTADUAL')
ON CONFLICT ("id") DO NOTHING;

-- 4. PRECEDENTES DE EXEMPLO
INSERT INTO "precedents"
  ("id","court","title","summary","subjectId",
   "forAll","forProcurador","forJuizFederal","forJuizEstadual",
   "judgmentDate","isRG","rgTheme","processClass","processNumber","organ","tags")
VALUES
('p1','STF','Tema 660 – Bem de família do fiador',
 'É penhorável o bem de família pertencente a fiador de contrato de locação. Exceção ao art. 3º, VII, da Lei 8.009/90.',
 's-civil', TRUE,FALSE,FALSE,FALSE,
 '2014-08-06',TRUE,660,'RE','407.688','Plenário',ARRAY['bem de família','fiador','locação']),
('p2','STJ','REsp 1.737.428 – Dano moral coletivo pelo Poder Público',
 'A pessoa jurídica de direito público pode ser condenada ao pagamento de dano moral coletivo when comprovada grave violação de direitos difusos.',
 's-admin', FALSE,TRUE,FALSE,FALSE,
 '2019-03-12',FALSE,NULL,'REsp','1737428','2ª Turma',ARRAY['dano moral','administração pública']),
('p3','STF','ADPF 347 – Estado de Coisas Inconstitucional no sistema prisional',
 'O sistema carcerário brasileiro configura Estado de Coisas Inconstitucional. Determinou-se ao Poder Executivo adoção de medidas estruturais.',
 's-const', FALSE,FALSE,FALSE,TRUE,
 '2015-09-09',FALSE,NULL,'ADPF','347','Plenário',ARRAY['sistema prisional','direitos fundamentais']),
('p4','TRF','Revisão de benefício previdenciário – Decadência decenal',
 'O INSS decai do direito de rever concessão de benefício previdenciário após 10 anos da sua concessão, salvo comprovada má-fé.',
 's-prev', FALSE,FALSE,TRUE,FALSE,
 '2022-05-15',FALSE,NULL,NULL,NULL,'TRF1',ARRAY['previdência','decadência','INSS'])
ON CONFLICT ("id") DO NOTHING;
