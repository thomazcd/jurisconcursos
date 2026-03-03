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

    return (
        <div className="modal-overlay" style={{ zIndex: 20000 }} onClick={() => { setShowHelp(false); setHelpStep(0); }}>
            <div className="modal-content-animated" onClick={e => e.stopPropagation()} style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-strong)',
                borderRadius: 30,
                padding: '2.5rem',
                maxWidth: '550px',
                width: 'calc(100% - 2rem)',
                boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Close button */}
                <button onClick={() => setShowHelp(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--surface2)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: '1rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

                {/* Ícone com fundo colorido */}
                <div style={{ width: 72, height: 72, borderRadius: '22px', background: 'linear-gradient(135deg, var(--accent), #14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', margin: '0 auto 1.25rem', boxShadow: '0 10px 25px rgba(20,184,166,0.3)', transform: 'rotate(-5deg)' }}>
                    {[
                        <SvgIcons.Sparkles size={36} key="s0" />,
                        <SvgIcons.Search size={36} key="s1" />,
                        <SvgIcons.Brain size={36} key="s2" />,
                        <SvgIcons.Sun size={36} key="s3" />,
                        <SvgIcons.Target size={36} key="s4" />,
                        <SvgIcons.Star size={36} key="s5" />,
                        <SvgIcons.Clipboard size={36} key="s6" />,
                        <SvgIcons.Chart size={36} key="s7" />
                    ][helpStep]}
                </div>

                {/* Título */}
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)', marginBottom: '0.75rem' }}>
                    {[
                        'Bem-vindo ao Juris 2.1!',
                        'Filtros e Matérias',
                        'Modo Leitura vs V/F',
                        'Conforto e Impressão',
                        'Modo Foco e Compacto',
                        'Favoritos e Anotações',
                        'Inteiro Teor e Detalhes',
                        'Contagem e Desempenho'
                    ][helpStep]}
                </h2>

                {/* Descrição */}
                <div style={{ color: 'var(--text-2)', lineHeight: '1.7', fontSize: '0.92rem', marginBottom: '2rem', background: 'var(--surface2)', borderRadius: 16, padding: '1.25rem', border: '1px solid var(--border)', textAlign: 'left' }}>
                    {[
                        'Escolha seu foco! No topo do dashboard, você pode alternar entre as trilhas específicas para Magistratura, Procuradorias ou visualizar "Todas as Matérias" do banco de dados de uma só vez.',
                        'Use o seletor para focar em uma matéria específica ou a barra de busca para encontrar temas. Filtre também por Tribunal (STF/STJ) ou pelo número do Informativo desejado de forma cirúrgica.',
                        'Transforme o portal! No topo, escolha entre o modo "Leitura" para ver as teses prontas, ou o modo "V/F" para esconder as teses e julgar os itens como certo ou errado, testando seu conhecimento.',
                        'Ajuste o tamanho da fonte (A+/A-) para sua leitura ideal. Troque entre modo claro e escuro no ícone de sol/lua para conforto visual, ou gere um PDF formatado de toda sua lista no botão de impressora.',
                        'Personalize a exibição! O Modo Foco remove distrações para leitura profunda. Já o Modo Compacto reduz o tamanho dos cards, excelente para revisões rápidas por listas de teses.',
                        'Salve o que é importante! Clique na Estrela para favoritar julgados críticos ou no ícone de Pen (Notas) para escrever seus próprios resumos vinculados diretamente ao julgado.',
                        'Precisa de mais contexto? Clique diretamente no Título do informativo ou no número do processo. Isso abrirá os detalhes completos com o texto do acórdão, tese, relator e órgão julgador.',
                        'O Juris monitora seu progresso. O contador azul mostra quantas vezes você já revisou aquele item e o sistema salva seu histórico de acertos/erros (V/F) para alimentar suas estatísticas globais.'
                    ][helpStep]}
                </div>

                {/* Pontos de progresso */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                        <div key={i} onClick={() => setHelpStep(i)} style={{ width: i === helpStep ? 24 : 8, height: 8, borderRadius: 99, background: i === helpStep ? 'var(--accent)' : 'var(--border-strong)', cursor: 'pointer', transition: 'all 0.2s' }} />
                    ))}
                </div>

                {/* Botões */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    {helpStep > 0 && <button className="btn btn-secondary" onClick={() => setHelpStep(helpStep - 1)}>← Voltar</button>}
                    <button className="btn btn-primary" onClick={() => helpStep < 7 ? setHelpStep(helpStep + 1) : setShowHelp(false)} style={{ borderRadius: 12, padding: '0 2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {helpStep < 7 ? 'Próximo →' : <><SvgIcons.CheckCircle size={18} /> Começar a Estudar!</>}
                    </button>
                </div>
            </div>
        </div>
    );
};
