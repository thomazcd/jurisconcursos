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
            description: 'O Juris agora é jurisconcursos.com.br! Uma plataforma de elite totalmente reimaginada para sua aprovação. Este guia detalhado cobre TODAS as ferramentas disponíveis para transformar seu estudo de jurisprudência.',
            icon: <SvgIcons.Sparkles size={36} />
        },
        {
            title: '🚀 Escopo de Estudo (Nível 1)',
            description: 'Localizado no cabeçalho, o botão "Habilitar Matérias" define seu universo de estudo. Aqui você seleciona as disciplinas que deseja carregar. Isso limpa o ruído do dashboard e permite focar apenas no que importa para sua meta atual. A contagem à direita mostra seu progresso (Lidos/Total) em cada matéria.',
            icon: <SvgIcons.Settings size={36} />
        },
        {
            title: '🔍 Filtro de Disciplina (Nível 2)',
            description: 'Na barra técnica, o seletor de matérias agora é dinâmico: ele exibe apenas as matérias que você habilitou no Nível 1. A opção "Todas as Habilitadas" permite visualizar o fluxo completo de julgados de todo o seu escopo selecionado, integrando o estudo de forma fluida.',
            icon: <SvgIcons.Subjects size={36} />
        },
        {
            title: '⚡ Busca Inteligente Cross-Data',
            description: 'Nossa barra de busca vasculha instantaneamente títulos, temas, resumos e números de processos. Dica de especialista: digite o número de um informativo (ex: "875") para isolar rapidamente todos os julgados daquela edição do tribunal selecionado.',
            icon: <SvgIcons.Search size={36} />
        },
        {
            title: '🏛️ Controle de Tribunais e Infos',
            description: 'Filtre por STF, STJ ou ambos simultaneamente. O seletor de Informativos permite um estudo retroativo cirúrgico, listando apenas os julgados publicados em cada edição. É a ferramenta perfeita para quem está "limpando" informativos atrasados.',
            icon: <SvgIcons.Landmark size={36} />
        },
        {
            title: '🧠 Estudo Ativo: Modo Flashcard',
            description: 'O botão "V/F" transforma seu dashboard em uma bateria de questões. A tese do julgado é omitida, desafiando você a julgar se o item é verdadeiro ou falso. Após decidir, revele a resposta para registrar seu Acerto (HIT) ou Erro (MISS) nas estatísticas.',
            icon: <SvgIcons.Brain size={36} />
        },
        {
            title: '🎯 Modo Foco e Modo Compacto',
            description: 'O Modo Foco (ícone de mira) remove distrações laterais e menus para uma leitura imersiva. O Modo Compacto (layout) reduz a altura dos cards, exibindo apenas Título e Tese, permitindo revisar dezenas de itens por minuto sem precisar rolar tanto a tela.',
            icon: <SvgIcons.Target size={36} />
        },
        {
            title: '🌓 Conforto Visual e Leitura',
            description: 'Personalize sua experiência: use os botões A+ e A- para ajustar o tamanho da fonte global. O tema escuro (ícone de lua) é otimizado para longas sessões noturnas. Use o ícone de impressora para gerar PDFs formatados de qualquer lista filtrada para estudo offline.',
            icon: <SvgIcons.Sun size={36} />
        },
        {
            title: '⭐ Favoritos e Anotações Pessoais',
            description: 'Construa seu repertório: clique na estrela para destacar julgados críticos. No ícone de lápis, abra o painel de anotações para escrever seus próprios mnemônicos, súmulas relacionadas ou pegadinhas de prova que você identificou. Tudo fica salvo na sua conta.',
            icon: <SvgIcons.Star size={36} />
        },
        {
            title: '📈 Rastreio de Leituras e Histórico',
            description: 'A constância é a alma da aprovação. O ícone azul em cada card indica quantas vezes você já revisou aquele julgado. Clique no número para abrir o histórico detalhado, vendo exatamente os dias e horários das suas revisões passadas.',
            icon: <SvgIcons.History size={36} />
        },
        {
            title: '📖 Inteiro Teor e Detalhes Técnicos',
            description: 'Precisa de mais profundidade? Clique no título do julgado para ver o Relator, Órgão Julgador, Datas e o Inteiro Teor estruturado. Se preferir o original, o botão "Ver Online" leva você diretamente à fonte oficial no site do respectivo tribunal.',
            icon: <SvgIcons.FileText size={36} />
        },
        {
            title: '📊 Estatísticas de Desempenho',
            description: 'No menu lateral (Estatísticas), você tem o raio-x do seu estudo. Visualize gráficos de acertos/erros no modo flashcard, sua evolução mensal e o percentual de cobertura do banco de dados por tribunal e por matéria.',
            icon: <SvgIcons.Chart size={36} />
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
                maxWidth: '620px',
                width: 'calc(100% - 2rem)',
                boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <button onClick={() => setShowHelp(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--surface2)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: '1rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

                <div style={{ width: 72, height: 72, borderRadius: '22px', background: 'linear-gradient(135deg, var(--accent), #14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', margin: '0 auto 1.25rem', boxShadow: '0 10px 25px rgba(20,184,166,0.3)', transform: 'rotate(-5deg)' }}>
                    {currentStep.icon}
                </div>

                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)', marginBottom: '0.75rem', textAlign: 'center' }}>
                    {currentStep.title}
                </h2>

                <div style={{ color: 'var(--text-2)', lineHeight: '1.7', fontSize: '0.95rem', marginBottom: '1.5rem', background: 'var(--surface2)', borderRadius: 16, padding: '1.5rem', border: '1px solid var(--border)', textAlign: 'left' }}>
                    {currentStep.description}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    {steps.map((_, i) => (
                        <div key={i} onClick={() => setHelpStep(i)} style={{ width: i === helpStep ? 24 : 8, height: 8, borderRadius: 99, background: i === helpStep ? 'var(--accent)' : 'var(--border-strong)', cursor: 'pointer', transition: 'all 0.2s' }} />
                    ))}
                </div>

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
                        {helpStep < steps.length - 1 ? 'Próximo →' : <><SvgIcons.CheckCircle size={18} /> Vamos Iniciar!</>}
                    </button>
                </div>
            </div>
        </div>
    );
};
