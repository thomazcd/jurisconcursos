
export interface ChangelogEntry {
    version: string;
    date: string;
    description: string;
    changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
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
