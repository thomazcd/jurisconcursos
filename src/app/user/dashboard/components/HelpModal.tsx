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
                {/* Ícone com fundo colorido */}
                <div style={{ width: 72, height: 72, borderRadius: '22px', background: 'linear-gradient(135deg, var(--accent), #14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', margin: '0 auto 1.25rem', boxShadow: '0 10px 25px rgba(20,184,166,0.3)', transform: 'rotate(-5deg)' }}>
                    {[
                        <SvgIcons.Sparkles size={36} key="s0" />,
                        <SvgIcons.Target size={36} key="s1" />,
                        <SvgIcons.Search size={36} key="s2" />,
                        <SvgIcons.Brain size={36} key="s3" />,
                        <SvgIcons.Minimize2 size={36} key="s4" />,
                        <SvgIcons.Sun size={36} key="s5" />,
                        <SvgIcons.Star size={36} key="s6" />,
                        <SvgIcons.Clipboard size={36} key="s7" />,
                        <SvgIcons.History size={36} key="s8" />,
                        <SvgIcons.Chart size={36} key="s9" />
                    ][helpStep]}
                </div>

                {/* Título */}
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)', marginBottom: '0.75rem' }}>
                    {[
                        'Seu Novo Juris 2.1!',
                        'Trilhas de Carreira',
                        'Filtros Inteligentes',
                        'Modos de Estudo (V/F)',
                        'Visualização Flexível',
                        'Conforto e Personalização',
                        'Favoritos e Anotações',
                        'Inteiro Teor e Detalhes',
                        'Contagem de Leituras',
                        'Estatísticas de Elite'
                    ][helpStep]}
                </h2>

                {/* Descrição */}
                <div style={{ color: 'var(--text-2)', lineHeight: '1.7', fontSize: '0.92rem', marginBottom: '1.5rem', background: 'var(--surface2)', borderRadius: 16, padding: '1.25rem', border: '1px solid var(--border)', textAlign: 'left' }}>
                    {[
                        'O Juris foi reimaginado! Criamos uma central de inteligência jurídica focada na sua aprovação em concursos de alto nível. Vamos conhecer as ferramentas que vão acelerar seu estudo!',
                        'No topo, você gerencia sua Trilha Ativa. Alterne entre Magistratura Estadual, Federal, Procuradorias ou a nova trilha "Todas as Matérias" para englobar todo o conhecimento de uma só vez.',
                        'Refine sua busca! Filtre por matérias específicas, busque por palavras-chave em tempo real, escolha entre STF/STJ ou selecione um número de Informativo específico para um estudo cirúrgico.',
                        'Estudo ativo é a chave. Use o botão "Leitura" para revisar teses completas, ou mude para o modo "V/F" (Flashcards) para esconder a tese e testar seu julgamento sobre o item.',
                        'Ganhe produtividade! O Modo Compacto permite revisar dezenas de itens rapidamente. Já o Modo Foco remove todas as distrações da tela, deixando você sozinho com o texto da lei e do julgado.',
                        'Seu conforto em primeiro lugar. Ajuste o tamanho da fonte (A+/A-), alterne entre modo claro e escuro para não cansar a vista e use o ícone de impressora para gerar PDFs formatados da sua lista.',
                        'Organize seu material! Clique na Estrela para destacar julgados "quentes" ou use o botão de Notas (Lápis) para criar seus próprios resumos e mnemônicos vinculados diretamente ao julgado.',
                        'Contexto é tudo. Ao clicar no Título do informativo ou no número do processo, você abre o Card de Detalhes com Tese, Relator, Órgão Julgador e o Inteiro Teor estruturado para consulta rápida.',
                        'Saiba onde você parou! O ícone azul nos cards mostra quantas vezes você já revisou aquele julgado. O Juris contabiliza cada leitura para garantir que você tenha a constância necessária até a prova.',
                        'Mensure sua evolução. No menu lateral "Estatísticas", você visualiza seu desempenho por matéria, tribunal e ano, além de um histórico detalhado de acertos e erros no modo flashcard.'
                    ][helpStep]}
                </div>

                {/* Pontos de progresso */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                        <div key={i} onClick={() => setHelpStep(i)} style={{ width: i === helpStep ? 20 : 7, height: 7, borderRadius: 99, background: i === helpStep ? 'var(--accent)' : 'var(--border-strong)', cursor: 'pointer', transition: 'all 0.2s' }} />
                    ))}
                </div>

                {/* Botões */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    {helpStep > 0 && <button className="btn btn-secondary" onClick={() => setHelpStep(helpStep - 1)} style={{ padding: '0 1.25rem' }}>← Voltar</button>}
                    <button className="btn btn-primary" onClick={() => helpStep < 9 ? setHelpStep(helpStep + 1) : setShowHelp(false)} style={{ borderRadius: 12, padding: '0 2rem', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '140px', justifyContent: 'center' }}>
                        {helpStep < 9 ? 'Próximo →' : <><SvgIcons.CheckCircle size={18} /> Entendi!</>}
                    </button>
                </div>
            </div>
        </div>
    );
};
