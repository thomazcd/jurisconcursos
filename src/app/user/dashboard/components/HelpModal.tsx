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
                        <SvgIcons.Gavel size={36} key="s1" />,
                        <SvgIcons.Layout size={36} key="s2" />,
                        <SvgIcons.Copy size={36} key="s3" />,
                        <SvgIcons.Brain size={36} key="s4" />,
                        <SvgIcons.Target size={36} key="s5" />,
                        <SvgIcons.RotateCw size={36} key="s6" />
                    ][helpStep]}
                </div>

                {/* Título */}
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)', marginBottom: '0.75rem' }}>
                    {[
                        'Bem-vindo ao Novo Juris!',
                        'Fidelidade Jurisdicional',
                        'Inteiro Teor Premium',
                        'Agilidade no Estudo',
                        'Flashcards (V/F)',
                        'Foco e Visualização',
                        'Filtros e Matérias'
                    ][helpStep]}
                </h2>

                {/* Descrição */}
                <div style={{ color: 'var(--text-2)', lineHeight: '1.7', fontSize: '0.92rem', marginBottom: '2rem', background: 'var(--surface2)', borderRadius: 16, padding: '1.25rem', border: '1px solid var(--border)', textAlign: 'left' }}>
                    {[
                        'A interface do Juris foi otimizada para sua aprovação. Desenvolvemos uma experiência fluida, premium e focada no alto rendimento. Vamos explorar as ferramentas fundamentais para sua jornada!',
                        'Implementamos precisão total para o STJ. Agora você visualiza o Órgão Julgador (Turmas/Seções) e a distinção clara entre Relator original e para Acórdão, garantindo que você estude com os dados exatos do informativo.',
                        'Acesse detalhes completos clicando diretamente no Número do Processo ou no ícone de busca. Isso abrirá o card com o Inteiro Teor estruturado e todas as informações acessoriais do julgado.',
                        'Facilitamos sua vida acadêmica. Ao abrir um card, você encontrará um botão para copiar o número do processo com um clique. Ideal para buscas rápidas ou citações em petições e resumos.',
                        'Estudo ativo é a chave. No topo, mude para "V/F" e teste seus conhecimentos. O sistema oculta a tese, permitindo que você julgue o item. Estatísticas em tempo real mostram seus pontos fortes e fracos.',
                        'Elimine distrações com o MODO FOCO. Se preferir uma visão ampla, o "Modo Compacto" permite visualizar dezenas de teses simultaneamente. Ajuste o tamanho da fonte para o conforto total dos olhos.',
                        'Agrupamos julgados por matéria automaticamente. Use a barra de pesquisa para encontrar palavras-chave. Filtre por Tribunal ou Informativo específico para nichar seu estudo de forma estratégica.'
                    ][helpStep]}
                </div>

                {helpStep === 6 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg)', borderRadius: 16, border: '1px solid var(--border)' }}>
                        <div style={{ textAlign: 'left', marginBottom: '0.5rem' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.25rem' }}>Zona de Gerenciamento</h4>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Atenção: estas ações limpam seu progresso local.</p>
                        </div>
                        <div
                            className="btn btn-secondary"
                            style={{ color: 'var(--rose)', borderColor: 'rgba(239, 68, 68, 0.2)', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'default', opacity: 0.8 }}
                        ><SvgIcons.RotateCcw size={14} /> Marcar TUDO como Não Lido</div>
                        <div
                            className="btn btn-secondary"
                            style={{ fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'default', opacity: 0.8 }}
                        ><SvgIcons.RotateCw size={14} /> Zerar Estatísticas de V/F</div>
                    </div>
                )}

                {/* Pontos de progresso */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {[0, 1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} onClick={() => setHelpStep(i)} style={{ width: i === helpStep ? 24 : 8, height: 8, borderRadius: 99, background: i === helpStep ? 'var(--accent)' : 'var(--border-strong)', cursor: 'pointer', transition: 'all 0.2s' }} />
                    ))}
                </div>

                {/* Botões */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    {helpStep > 0 && <button className="btn btn-secondary" onClick={() => setHelpStep(helpStep - 1)}>← Voltar</button>}
                    <button className="btn btn-primary" onClick={() => helpStep < 6 ? setHelpStep(helpStep + 1) : setShowHelp(false)} style={{ borderRadius: 12, padding: '0 2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {helpStep < 6 ? 'Próximo →' : <><SvgIcons.CheckCircle size={18} /> Entendi!</>}
                    </button>
                </div>
            </div>
        </div>
    );
};
