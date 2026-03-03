import React from 'react';
import { Icons as SvgIcons } from '@/components/ui/Icons';

interface HelpModalProps {
    showHelp: boolean;
    setShowHelp: (val: boolean) => void;
    helpStep: number;
    setHelpStep: (val: number) => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({
    showHelp, setShowHelp, helpStep, setHelpStep
}) => {
    if (!showHelp) return null;

    const steps = [
        {
            title: 'Bem-vindo ao Juris 2.1!',
            description: 'O Juris foi totalmente reimaginado para ser sua central de inteligência jurídica. Preparamos este guia completo para você dominar todas as ferramentas de estudo de elite. Vamos lá?',
            icon: <SvgIcons.Sparkles size={36} />
        },
        {
            title: '1. Gestão de Escopo (Nível 1)',
            description: 'No topo da tela, o botão "Habilitar Matérias" é sua ferramenta mais importante. Clique nele para abrir o Modal de Escopo e marcar quais matérias você quer carregar no seu dashboard. Isso mantém seu foco apenas no que você precisa estudar hoje.',
            icon: <SvgIcons.Settings size={36} />
        },
        {
            title: '2. Filtros Dinâmicos (Nível 2)',
            description: 'A barra de filtros embaixo se adapta à sua escolha no topo. O seletor de matérias mostrará apenas o que você habilitou. A opção "Todas as Habilitadas" combina julgados de todo o seu escopo escolhido de uma só vez.',
            icon: <SvgIcons.Subjects size={36} />
        },
        {
            title: '3. Busca em Tempo Real',
            description: 'Use a barra de busca para encontrar julgados por palavras-chave, número do informativo ou tema. A busca é instantânea e vasculha título, tese e até o número do processo.',
            icon: <SvgIcons.Search size={36} />
        },
        {
            title: '4. Tribunais e Informativos',
            description: 'Alterne rapidamente entre STF, STJ ou ambos. Use o seletor de Informativos para focar em uma edição específica (ex: Inf. 875) ou navegue por todo o período histórico disponível no banco.',
            icon: <SvgIcons.Landmark size={36} />
        },
        {
            title: '5. Modo Leitura vs. Flashcards',
            description: 'No Header, alterne entre "Leitura" (ver a tese completa) e "V/F" (Flashcards). No modo V/F, a tese fica escondida. Você deve julgar o item como CERTO ou ERRADO para revelar a resposta e registrar seu desempenho.',
            icon: <SvgIcons.Brain size={36} />
        },
        {
            title: '6. Modo Foco (Produtividade)',
            description: 'O botão "Modo Foco" remove todos os menus e distrações da tela. É ideal para sessões de estudo profundo. Você também pode ativar o "Modo Compacto" para revisar dezenas de julgados por minuto, vendo apenas o essencial.',
            icon: <SvgIcons.Target size={36} />
        },
        {
            title: '7. Personalização (Fonte e Tema)',
            description: 'Ajuste o tamanho do texto (A+/A-) para o seu conforto visual. Use o ícone de Lua/Sol para alternar entre o Modo Claro e o Modo Escuro. Suas preferências são salvas automaticamente.',
            icon: <SvgIcons.Sun size={36} />
        },
        {
            title: '8. Favoritos e Anotações',
            description: 'Clique na Estrela em qualquer card para salvar nos favoritos. Use o ícone de Lápis para criar anotações personalizadas, resumos ou mnemônicos que ficam vinculados àquele julgado.',
            icon: <SvgIcons.Star size={36} />
        },
        {
            title: '9. Histórico e Contagem de Leituras',
            description: 'O ícone azul com número em cada card mostra quantas vezes você já leu aquele julgado. Clique nele para ver o histórico detalhado com datas e horários de cada revisão.',
            icon: <SvgIcons.History size={36} />
        },
        {
            title: '10. Inteiro Teor e Exportação',
            description: 'Clique no título de qualquer julgado para abrir os detalhes completos, incluindo relator, órgão julgador e o Inteiro Teor estruturado. Precisa levar para o papel? Use o ícone da impressora para gerar um PDF formatado da sua lista filtrada.',
            icon: <SvgIcons.FileText size={36} />
        }
    ];

    const currentStep = steps[helpStep];

    return (
        <div className="modal-overlay" style={{ zIndex: 20000 }} onClick={() => { setShowHelp(false); setHelpStep(0); }}>
            <div className="modal-content-animated" onClick={e => e.stopPropagation()} style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-strong)',
                borderRadius: 30,
                padding: '2.5rem',
                maxWidth: '600px',
                width: 'calc(100% - 2rem)',
                boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Close button */}
                <button onClick={() => setShowHelp(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--surface2)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: '1rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

                {/* Ícone com fundo colorido */}
                <div style={{ width: 72, height: 72, borderRadius: '22px', background: 'linear-gradient(135deg, var(--accent), #14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', margin: '0 auto 1.25rem', boxShadow: '0 10px 25px rgba(20,184,166,0.3)', transform: 'rotate(-5deg)' }}>
                    {currentStep.icon}
                </div>

                {/* Título */}
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)', marginBottom: '0.75rem', textAlign: 'center' }}>
                    {currentStep.title}
                </h2>

                {/* Descrição */}
                <div style={{ color: 'var(--text-2)', lineHeight: '1.7', fontSize: '0.95rem', marginBottom: '1.5rem', background: 'var(--surface2)', borderRadius: 16, padding: '1.5rem', border: '1px solid var(--border)', textAlign: 'left' }}>
                    {currentStep.description}
                </div>

                {/* Pontos de progresso */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    {steps.map((_, i) => (
                        <div key={i} onClick={() => setHelpStep(i)} style={{ width: i === helpStep ? 24 : 8, height: 8, borderRadius: 99, background: i === helpStep ? 'var(--accent)' : 'var(--border-strong)', cursor: 'pointer', transition: 'all 0.2s' }} />
                    ))}
                </div>

                {/* Botões */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    {helpStep > 0 && (
                        <button
                            className="btn btn-secondary"
                            onClick={() => setHelpStep(helpStep - 1)}
                            style={{ padding: '0 1.5rem', height: '48px', borderRadius: '14px', fontWeight: 800 }}
                        >
                            ← Voltar
                        </button>
                    )}
                    <button
                        className="btn btn-primary"
                        onClick={() => helpStep < steps.length - 1 ? setHelpStep(helpStep + 1) : setShowHelp(false)}
                        style={{ borderRadius: '14px', padding: '0 2.5rem', height: '48px', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '160px', justifyContent: 'center', fontWeight: 900 }}
                    >
                        {helpStep < steps.length - 1 ? 'Próximo →' : <><SvgIcons.CheckCircle size={18} /> Começar!</>}
                    </button>
                </div>
            </div>
        </div>
    );
};
