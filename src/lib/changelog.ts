
export interface ChangelogEntry {
    version: string;
    date: string;
    description: string;
    changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
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
