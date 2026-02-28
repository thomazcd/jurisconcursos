-- Adicionar matérias ausentes necessárias para os novos informativos
INSERT INTO "subjects" ("id", "name", "trackScope") VALUES
('s-eca', 'ECA', 'COMMON'),
('s-cons', 'Direito do Consumidor', 'COMMON'),
('s-sau', 'Direito da Saúde', 'COMMON')
ON CONFLICT ("id") DO NOTHING;
