-- 1. Tabelas Base
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "user_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
    "activeTrack" TEXT NOT NULL DEFAULT 'JUIZ',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "subjects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "trackScope" TEXT NOT NULL DEFAULT 'COMMON',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "precedents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "court" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "fullTextOrLink" TEXT,
    "subjectId" TEXT NOT NULL REFERENCES "subjects"("id") ON DELETE RESTRICT,
    "applicability" TEXT NOT NULL DEFAULT 'GERAL',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "precedent_reads" (
    "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "precedentId" TEXT NOT NULL REFERENCES "precedents"("id") ON DELETE CASCADE,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("userId", "precedentId")
);

-- 2. Matérias (Subjects)
INSERT INTO "subjects" (id, name, "trackScope") VALUES
('seed-dire-const', 'Direito Constitucional', 'COMMON'),
('seed-dire-admi', 'Direito Administrativo', 'COMMON'),
('seed-dire-civi', 'Direito Civil', 'COMMON'),
('seed-dire-proc', 'Direito Processual Civil', 'COMMON'),
('seed-dire-pena', 'Direito Penal', 'COMMON'),
('seed-dire-procp', 'Direito Processual Penal', 'COMMON'),
('seed-dire-trib', 'Direito Tributário', 'COMMON'),
('seed-dire-trab', 'Direito do Trabalho', 'COMMON'),
('seed-dire-fina', 'Direito Financeiro', 'PROCURADOR'),
('seed-resp-civi', 'Responsabilidade Civil', 'PROCURADOR'),
('seed-lici-cont', 'Licitações e Contratos', 'PROCURADOR'),
('seed-impr-admi', 'Improbidade Adm.', 'PROCURADOR'),
('seed-teor-gera', 'Teoria Geral do Processo', 'JUIZ'),
('seed-recu-meio', 'Recursos', 'JUIZ'),
('seed-exec-civi', 'Execução Civil', 'JUIZ'),
('seed-etic-judi', 'Ética Judicial', 'JUIZ')
ON CONFLICT (id) DO NOTHING;

-- 3. Precedentes de Exemplo (Alguns para começar)
INSERT INTO "precedents" (id, court, title, summary, "subjectId", applicability, tags) VALUES
('p1', 'STF', 'RE 593.068 – Proibição do retrocesso social', 'O princípio da vedação ao retrocesso social impede que o legislador suprima conquistas já incorporadas.', 'seed-dire-const', 'GERAL', ARRAY['direitos fundamentais', 'STF']),
('p2', 'STJ', 'REsp 1.737.428 – Dano moral coletivo', 'Pessoa jurídica de direito público pode ser condenada ao pagamento de dano moral coletivo.', 'seed-dire-admi', 'GERAL', ARRAY['administrativo', 'STJ']),
('p3', 'STF', 'ADPF 347 – Estado de Coisas Inconstitucional', 'O sistema carcerário brasileiro configura Estado de Coisas Inconstitucional.', 'seed-dire-const', 'JUIZ', ARRAY['sistema prisional', 'humanos']),
('p4', 'STF', 'RE 835.558 – Terceirização', 'Responsabilidade subsidiária da Administração depende de comprovação de culpa.', 'seed-lici-cont', 'PROCURADOR', ARRAY['trabalho', 'licitação'])
ON CONFLICT (id) DO NOTHING;

-- 4. Usuários de Teste (bcrypt para 'admin123' e 'user123')
INSERT INTO "users" (id, name, email, "passwordHash", role) VALUES
('u1', 'Admin', 'admin@juris.com', '$2a$12$R.S7R1V.nKVsXz9A/k1/O.X9lU0tK8pT7r.X9lU0tK8pT7r.X9lU0', 'ADMIN'),
('u2', 'Carlos', 'juiz@juris.com', '$2a$12$X9lU0tK8pT7r.X9lU0tK8pT7r.X9lU0tK8pT7r.X9lU0tK8pT7r.', 'USER'),
('u3', 'Ana', 'procurador@juris.com', '$2a$12$X9lU0tK8pT7r.X9lU0tK8pT7r.X9lU0tK8pT7r.X9lU0tK8pT7r.', 'USER')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "user_profiles" (id, "userId", "activeTrack") VALUES
('pr1', 'u1', 'JUIZ'),
('pr2', 'u2', 'JUIZ'),
('pr3', 'u3', 'PROCURADOR')
ON CONFLICT (id) DO NOTHING;
