# Juris Concursos - Blueprint de Implantação v1.1.000

Este documento contém as instruções estruturadas para recriar a plataforma Juris Concursos do zero, mantendo a arquitetura, stack tecnológica e as funcionalidades premium implementadas.

## 1. Stack Tecnológica
- **Framework:** Next.js 14+ (App Router)
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL (via Prisma ORM)
- **Autenticação:** NextAuth.js
- **Estilização:** CSS Vanilla ou Tailwind (conforme preferência, atual é focado em CSS customizado para estética premium).

## 2. Estrutura de Dados (Prisma Schema)
O banco de dados deve suportar as seguintes entidades:
- **User:** Incluindo campos para preferências (isDark, fontSize, displayMode).
- **Subject:** Matérias (Direito Constitucional, Administrativo, etc).
- **Precedent:** O julgado em si, com campos para tribunal, tese, resumo, número do processo, relator, informativo e flags de visibilidade (geral, juiz, procurador).
- **ReadEvent:** Histórico granular de leituras (data/hora) e resultados de Flashcards (Certo/Errado).

## 3. Funcionalidades Core (Frontend)

### Dashboard do Usuário
- **Listagem Agrupada:** Julgados agrupados por matéria com contadores de pendências.
- **Filtros Avançados:** Busca textual, filtro por tribunal (STF/STJ), ano do informativo e status (Lido/Não Lido/Favoritos/Erros).
- **Modos de Estudo:**
    - *Modo Leitura:* Visualização completa dos julgados.
    - *Modo Flashcard (V/F):* Esconde a tese e exige julgamento do usuário, gerando estatísticas de acerto.
- **Barra de Acessibilidade:** Ajuste de fonte (A+/A-), toggle de Tema (Dark/Light), Modo Foco (alvo) e Modo Compacto (layout denso).

### Componentes de UI Premium
- **Icons.tsx:** Biblioteca centralizada de ícones SVG (evitar emojis para manter o aspecto profissional).
- **Modais Animados:** Detalhes do julgado, histórico de leitura, anotações pessoais e tutorial de boas-vindas.
- **Skeleton Loading:** Carregamento suave para evitar saltos na tela.

## 4. Lógica de Negócios e API
- **Controle de Leitura:** Endpoint para registrar leituras, revisões e resultados de flashcards, atualizando o `ReadMap` em tempo real.
- **Favoritos:** Sistema de toggle para salvar julgados importantes.
- **Notas:** Permite que o usuário salve lembretes específicos em cada card.

## 5. Instruções Específicas de Design
- **Estética:** Usar "Glassmorphism" (efeitos de vidro/transparência), gradientes suaves (`linear-gradient`) e sombras profundas (`box-shadow`).
- **Espaçamento:** Manter layout denso (compacto) para concurseiros que lidam com grande volume de dados.
- **Tipografia:** Usar fontes modernas e clean (ex: Inter, Outfit ou sans-serif de alta qualidade).

## 6. Comandos de Setup Sugeridos
1. `npx create-next-app@latest`
2. `npm install prisma @prisma/client next-auth bcryptjs zod`
3. `npx prisma init`
4. `npm run dev` (para desenvolvimento)

## 7. Versionamento
- Manter o arquivo `src/lib/version.ts` para controle centralizado da versão exibida na plataforma.
