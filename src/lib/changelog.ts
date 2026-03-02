
export interface ChangelogEntry {
    version: string;
    date: string;
    description: string;
    changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
    {
        version: '1.1.033',
        date: '2026-03-02',
        description: 'Fidelidade de Texto e Agilidade no Copiar',
        changes: [
            'Preservação de Parágrafos: O texto do Inteiro Teor agora mantém a estrutura original do informativo.',
            'Botão Copiar Processo: Disponível dentro do card com mensagem de confirmação instantânea.',
            'Refinamento de Importação: Script otimizado para não remover quebras de linha essenciais.',
            'Deploy: Atualização enviada para produção Vercel.'
        ]
    },
    {
        version: '1.1.032',
        date: '2026-03-02',
        description: 'Funcionalidade de Cópia e Ícones',
        changes: [
            'Cópia de Processo: Adicionado botão no modal para copiar o número do processo com feedback visual.',
            'Biblioteca de Ícones: Inclusão dos ícones "Copy" e "Check" para suporte a interações de clipboard.',
            'Refinamento UI: Botão de cópia minimalista integrado ao layout de metadados do card.',
            'Deploy: Atualização enviada para produção.'
        ]
    },
    {
        version: '1.1.031',
        date: '2026-03-02',
        description: 'Ajuste de Fluxo de Leitura (Metadata)',
        changes: [
            'Reordenação Lógica: Metadados do dashboard agora seguem o fluxo Informativo -> Processo -> Órgão -> Ministro.',
            'Otimização de Escaneabilidade: Datas de julgamento e publicação movidas para o final da linha de metadados.',
            'Consistência Visual: Mantido o destaque em negrito para o Órgão Julgador.',
            'Deploy: Versão estável enviada para produção.'
        ]
    },
    {
        version: '1.1.030',
        date: '2026-03-02',
        description: 'Refinamento de Usabilidade e Dashboard',
        changes: [
            'Rapporteur Inteligente: No dashboard, exibe apenas o Relator p/ acórdão (vencedor) se existir, reduzindo texto.',
            'Fidelidade Total no Modal: Detalhes completos com relator original e vencedor continuam disponíveis no card.',
            'STJ Jurisdicional: Órgãos (Turmas/Seções) agora exibidos com destaque no dashboard.',
            'Deploy Automatizado: Atualização de build para Vercel refletindo novas lógicas de importação.'
        ]
    },
    {
        version: '1.1.029',
        date: '2026-03-02',
        description: 'Fidelidade de Órgãos e Relatores (STJ)',
        changes: [
            'Refinamento de Órgão: Agora distingue corretamente Turmas, Seções e Corte Especial no STJ.',
            'Relator p/ Acórdão: Exibição dual quando houver relator original e relator vencedor.',
            'Dashboard Aprimorado: O órgão julgador agora aparece diretamente no card do julgado.',
            'Whitelist de Órgãos: Impede que relatores sejam confundidos com o órgão julgador.',
            'Correção "Min.": Garantia de prefixo respeitoso em todos os nomes de magistrados.'
        ]
    },
    {
        version: '1.1.028',
        date: '2026-03-02',
        description: 'Qualidade de Dados e Refinamento do Informativo 875',
        changes: [
            'Correção integral dos títulos e súmulas do Informativo 875 (ex: MS 31.562-DF).',
            'Padronização respeitosa: Adicionado prefixo "Min." a todos os nomes de julgadores.',
            'Interface Premium: Novo design para cabeçalhos de matérias com badges de contagem.',
            'Tutorial 2.0: Guia interativo atualizado com as novas funcionalidades e dicas de estudo.',
            'Correção do Modal: O campo de Tema agora oculta badges vazios quando não há afetação numerada.',
            'Otimização de Importação: Bloqueio automático de recursos de afetação (ProAfR) para limpeza do banco.'
        ]
    },
    {
        version: '1.1.027',
        date: '2026-03-02',
        description: 'Finalização do Informativo 875 e Refinamento do Dashboard',
        changes: [
            'Sumarização inteligente dos títulos para melhor legibilidade no Dashboard.',
            'Restauração da visualização agrupada por matérias no filtro "Todas as Matérias".',
            'Correção do PIN badge: agora só aparece em julgados com número de tema oficial.',
            'Ajuste na extração de datas de julgamento e publicação do Informativo 875.',
            'Novo estilo "moderno" para divisores de matérias com contador de julgados.',
            'Tutorial atualizado com todas as novas funções (Notas, Filtros, Foco).'
        ]
    },
    {
        version: '1.1.026',
        date: '2026-03-01',
        description: 'Informativo 875 Completo',
        changes: [
            'Importação de todos os 25 julgados do Informativo 875/STJ.',
            'Ajuste na exibição de temas: badges agora aparecem apenas para temas numerados (Pipe Trick).',
            'Melhoria na detecção automática de Ramos do Direito e Órgãos Julgadores.',
            'Inclusão automática de "Destaque" e "Inteiro Teor" nos detalhes do julgado.',
        ],
    },
    {
        version: '1.1.025',
        date: '01/03/2026',
        description: 'Sincronização de Trilha e Limpeza de Matérias',
        changes: [
            'Sincronização Imediata: A troca de trilha (concurso) agora atualiza a barra lateral e o progresso instantaneamente, sem necessidade de recarregar a página.',
            'Otimização de Matérias: Removidas matérias não utilizadas (Saúde, Digital, Licitações), mantendo apenas o foco nas carreiras selecionadas.',
            'Informativo 875 - Part 1: Importação oficial dos Julgados 1 e 2 com formatação de Inteiro Teor limpa.',
            'Refinamento de Títulos: Consolidação do "Pipe Trick" para exibir simultaneamente o número do tema no badge e a descrição completa no modal.',
        ]
    },
    {
        version: '1.1.024',
        date: '01/03/2026',
        description: 'Diferenciação entre Tema-Número e Tema-Assunto',
        changes: [
            'Badge Minimalista: No Dashboard, o badge do Tema agora exibe apenas o número (ex: Tema 1317).',
            'Título Fiel no Modal: Ao abrir os detalhes, o título exibido é o "TEMA-ASSUNTO" integral, sem resumos.',
            'Metadados Refinados: No quadro de informações do modal, o Tema também aparece de forma simplificada.',
        ]
    },
    {
        version: '1.1.023',
        date: '01/03/2026',
        description: 'Reorganização do Modal e Título Completo',
        changes: [
            'Título Jurídico Completo: O topo do modal agora exibe o "Tema-Assunto" integral extraído do PDF.',
            'Inversão de Ordem: O card de metadados (Tribunal, Relator, etc.) agora aparece no topo, seguido pela Tese e pelo Inteiro Teor.',
            'Fidelidade Máxima: O campo "Tema" agora armazena a descrição completa do julgado para fins de consulta rápida.',
        ]
    },
    {
        version: '1.1.022',
        date: '01/03/2026',
        description: 'Adição de Órgão Julgador e Melhorias de Detalhes',
        changes: [
            'Órgão Julgador: Agora o campo "Órgão" é exibido no card de detalhes do modal.',
            'Refinamento Visual: Ajustes finos no alinhamento dos ícones e textos informativos.',
        ]
    },
    {
        version: '1.1.021',
        date: '01/03/2026',
        description: 'Reversão de Tema e Título do Modal',
        changes: [
            'Tema Simplificado: O campo tema voltou a exibir apenas o número (ex: Tema 1317).',
            'Título do Modal: Retornou ao formato reduzido e objetivo do dashboard.',
            'Manutenção: Mantidos os alinhamentos de grade e o rótulo "DESTAQUE:" no modal.',
        ]
    },
    {
        version: '1.1.020',
        date: '01/03/2026',
        description: 'Aprimoramento do Modal de Detalhes e Fidelidade de Título',
        changes: [
            'Título Fiel no Modal: O modal agora exibe o título jurídico completo (original do informativo).',
            'Rótulo DESTAQUE: Restaurado o rótulo "DESTAQUE:" antes da tese dentro do modal.',
            'Alinhamento de Metadados: Corrigido o alinhamento visual dos ícones e informações no card de detalhes.',
            'Processo Único: Limitação a apenas um número de processo por julgado para maior clareza.',
        ]
    },
    {
        version: '1.1.019',
        date: '01/03/2026',
        description: 'Refinamento de Dados e Visualização de Processos Múltiplos',
        changes: [
            'Processos Múltiplos: Dashboard mostra apenas o 1º número, enquanto o Modal detalha todos os processos vinculados.',
            'Tema (Info): O badge do Tema (ex: Tema 1317) voltou a ser exibido no card e no modal.',
            'Resumo de Títulos: Removido o uso de dois pontos (:) nos títulos resumidos para um visual mais limpo.',
            'Fidelidade Legal: Termos como "Embargos à Execução Fiscal" agora são mantidos por extenso para evitar ambiguidades técnicos.',
        ]
    },
    {
        version: '1.1.018',
        date: '01/03/2026',
        description: 'Limpeza Visual Extrema e Fidelidade do Inteiro Teor',
        changes: [
            'Remoção de Rótulos: Retirado o texto "TESE / DESTAQUE" e as barras/fundos verdes do resumo.',
            'Inteiro Teor Integral: Importação 100% fiel ao texto do usuário, com parágrafos e sem cortes.',
            'Metadados Clean: Removidos fundos coloridos nos badges de informativo, processo e julgado.',
            'Relator por Extenso: Agora exibe o nome completo do Ministro/Relator.',
        ]
    },
    {
        version: '1.1.017',
        date: '01/03/2026',
        description: 'Bulk Import e Títulos com IA',
        changes: [
            'Carga Completa: Importação dos 25 julgados do Informativo 875.',
            'IA Títulos: Redução inteligente dos títulos para melhor escaneabilidade.',
            'Modal Detalhado: Melhoria no scroll e padding do informativo.',
        ]
    },
    {
        version: '1.1.016',
        date: '01/03/2026',
        description: 'Ajustes no Dashboard e Agrupamento',
        changes: [
            'Desativado agrupamento na visão "Todas as Matérias" para evitar confusão visual.',
            'Correção na importação do APP_VERSION.',
        ]
    },
    {
        version: '1.1.015',
        date: '01/03/2026',
        description: 'Melhoria na exibição de julgados e modal compacto',
        changes: [
            'Filtro de duplicidade: Precedentes em múltiplas matérias aparecem apenas uma vez na visão "Todas as Matérias".',
            'Modal Detalhado: Layout centralizado e compacto com texto do Inteiro Teor justificado.',
            'Ações discretas: Botão de marcar como lido e ícone de reset mais sutis para não poluir o visual.',
            'Carga teste: Inserção do primeiro julgado do Informativo 875 na v1.1.015.',
        ]
    },
    {
        version: '1.1.014',
        date: '01/03/2026',
        description: 'Refatoração da exibição e carga do Inf. 875',
        changes: [
            'Refatoração UI: Tema-Assunto como título principal do card.',
            'Destaque visual da Tese (Destaque) abaixo do título.',
            'Criação de modal específico para "Inteiro Teor" (Long Text).',
            'Carga bem sucedida: Inserção do Julgado 1 do Informativo 875 com nova estrutura.',
        ]
    },
    {
        version: "1.1.013",
        date: "01/03/2026",
        description: "Sincronização do Log de Versões.",
        changes: [
            "Atualização do histórico para refletir o estado atual do projeto (v1.1.013).",
            "Garantia de que o Log Admin esteja sempre emparelhado com a versão do sistema."
        ]
    },
    {
        version: "1.1.012",
        date: "01/03/2026",
        description: "Fix: Correção de erro crítico no build da Vercel.",
        changes: [
            "Resolução de conflito entre Server Components e styled-jsx.",
            "Migração de estilos específicos do Changelog para o CSS Global."
        ]
    },
    {
        version: "1.1.011",
        date: "01/03/2026",
        description: "Adição do Log de Versões (Changelog) para administradores.",
        changes: [
            "Criação deste menu de acompanhamento histórico das versões.",
            "Centralização das notas de atualização para facilitar a gestão."
        ]
    },
    {
        version: "1.1.010",
        date: "01/03/2026",
        description: "Preparação estrutural para reset de banco e controle manual.",
        changes: [
            "Otimização para inserção manual de julgados garantindo 100% de fidelidade aos PDFs.",
            "Limpeza de registros duplicados e inconsistentes da migração automática."
        ]
    },
    {
        version: "1.1.009",
        date: "01/03/2026",
        description: "Expansão da busca por Informativo.",
        changes: [
            "Agora é possível pesquisar julgados pelo número do Informativo tanto no Dashboard quanto no Admin.",
            "Melhoria na performance da busca global."
        ]
    },
    {
        version: "1.1.008",
        date: "28/02/2026",
        description: "Motor de Sugestão Inteligente no Admin.",
        changes: [
            "O sistema agora sugere matérias automaticamente ao identificar palavras-chave no título ou resumo.",
            "Facilitação da marcação de referências cruzadas (ex: marca Direito Tributário ao ler 'REFIS')."
        ]
    },
    {
        version: "1.1.007",
        date: "28/02/2026",
        description: "Novas colunas e busca aprimorada no Admin.",
        changes: [
            "Inclusão das colunas 'Inf.' (Informativo) e 'Processo' na tabela de Precedentes do Admin.",
            "Filtro de busca no Admin agora considera número de processo e informativo."
        ]
    },
    {
        version: "1.1.005 - 1.1.006",
        date: "28/02/2026",
        description: "Robustez nas Referências Cruzadas.",
        changes: [
            "Lógica de badges à prova de falhas (ignora espaços, acentos e variações de maiúsculas).",
            "Garantia de que o badge '+ Matéria' apareça corretamente em contextos cruzados."
        ]
    },
    {
        version: "1.1.003 - 1.1.004",
        date: "28/02/2026",
        description: "Reformulação da Interface de Detalhes.",
        changes: [
            "Substituição do painel lateral por um Modal Central grande e espaçoso para consulta e edição.",
            "Ajuste no Dashboard para mostrar apenas matérias correlatas (evitando redundância)."
        ]
    },
    {
        version: "1.1.001 - 1.1.002",
        date: "28/02/2026",
        description: "Início do versionamento e Múltiplas Matérias.",
        changes: [
            "Implementação do sistema de múltiplas matérias por julgado (ligação Many-to-Many).",
            "Início do controle oficial de versões do projeto."
        ]
    }
];
