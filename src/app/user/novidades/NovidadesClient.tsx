'use client';
import { useState, useEffect } from 'react';
import { Icons as SvgIcons } from '@/components/ui/Icons';

interface Informatory {
    court: string;
    number: string;
    year: number | null;
    lastUpdate: string;
}

const CHANGELOG = [
    { version: 'v2.1.049', date: '04/03/2026', title: 'Integração de Metadados via IA', desc: 'Mapeamento automatizado de Data de Publicação Oficial e extração contextual das Tags (Ramos do Direito) direto dos PDEs de Jurisprudência para o Banco de Dados durante a revisão.' },
    { version: 'v2.1.048', date: '04/03/2026', title: 'Painel Aprimorado de Inteiro Teor', desc: 'Aplicação de formatação de justificação automática e sincronização da fonte de leitura no editor invisível de importação massiva, para pré-visualização fidedigna.' },
    { version: 'v2.1.047', date: '04/03/2026', title: 'Tracking Temporal & Date Fetcher', desc: 'Introdução do cronômetro reactivo de extração de PDFs pesados (Lendo... Xs) e injeção do extrator visual inteligente que capta a data de publicação original do fascículo no cabeçalho dos Boletins.' },
    { version: 'v2.1.046', date: '04/03/2026', title: 'Filtro Anti-Rodapé', desc: 'Novo filtro heurístico programado para rejeitar lixo textual no fim de informativos gerados via NotebookLLM (ignora automaticamente blocos iniciados apenas por LEGISLAÇÃO isolada).' },
    { version: 'v2.1.045', date: '04/03/2026', title: 'Extração Robusta DJe/DJEN', desc: 'Proteção contra variações sintáticas para não perder datas de publicação de acórdão, aceitando "Data de Publicação", "Data Publicação (DJe)", etc.' },
    { version: 'v2.1.043', date: '04/03/2026', title: 'Proteção Contra Cortes e Variações Gramaticais', desc: 'Correção de segurança no Parser interno para evitar mutilação de Títulos (Tema-Assunto) longos que continham pontos finais e flexibilização na leitura das Tags se estivessem no plural (Ramos) ou singular (Ramo).' },
    { version: 'v2.1.041', date: '04/03/2026', title: 'Quebra Inteligente de Parágrafos', desc: 'Lógica refinada para o separador de conectivos (Todavia, Com efeito), exigindo pausa real de pontuação prévia para não queimar blocos no meio das frases por causa de meras vírgulas.' },
    { version: 'v2.1.040', date: '04/03/2026', title: 'Importador Mágico Inline UI', desc: 'Revolução Visual: Sai de cena a página sequencial e entra uma esteira inline de revisão onde o coordenador consegue revisar lado a lado todas as teses sem carregar abas novas, agrupadas em lote.' },
    { version: 'v2.1.039', date: '04/03/2026', title: 'Bypass para Estruturas NotebookLLM', desc: 'A funcionalidade mágica nativa foi adicionada para interpretar caixas de texto com Markdown gerado pela IA da Google de forma instantânea sem precisar subir PDF.' }
];

export default function NovidadesClient() {
    const [data, setData] = useState<{ informatories: Informatory[], lastUpdate: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/user/informatories')
            .then(async (r) => {
                const d = await r.json();
                if (!r.ok) throw new Error(d.error || 'Erro ao carregar informativos');
                return d;
            })
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message || 'Erro ao comunicar com o servidor.');
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <div className="loader">Carregando...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#ef4444' }}>
                <p style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
                    <SvgIcons.AlertCircle size={24} /> {error}
                </p>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            <header className="page-header" style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <SvgIcons.Sparkles size={24} style={{ color: 'var(--accent)' }} /> Novidades e Atualizações
                    </h1>
                </div>
                <p className="page-subtitle">Acompanhe a alimentação da nossa base de dados em tempo real.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.8rem', background: 'var(--accent-g)', borderRadius: '12px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <SvgIcons.Calendar size={24} />
                        </div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Última Atualização</h2>
                    </div>
                    <p style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent)' }}>
                        {data?.lastUpdate ? new Date(data.lastUpdate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : '---'}
                    </p>
                    <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        A base é alimentada semanalmente com os novos informativos publicados.
                    </p>
                </div>

                <div className="card" style={{ gridRow: 'span 2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.8rem', background: 'rgba(5, 150, 105, 0.1)', borderRadius: '12px', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <SvgIcons.Book size={24} />
                        </div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Informativos no Banco</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {data?.informatories.map((inf, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.85rem 1rem',
                                background: 'var(--bg)',
                                borderRadius: '12px',
                                border: '1px solid var(--border-strong)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <span className={`badge ${inf.court === 'STF' ? 'badge-stf' : 'badge-stj'}`}>{inf.court}</span>
                                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>Informativo {inf.number}{inf.year ? `/${inf.year}` : ''}</span>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                                    {new Date(inf.lastUpdate).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                        ))}
                        {(!data?.informatories || data.informatories.length === 0) && (
                            <p style={{ textAlign: 'center', color: 'var(--text-3)', padding: '2rem' }}>Nenhum informativo carregado ainda.</p>
                        )}
                    </div>
                </div>

                <div className="card" style={{ background: 'var(--accent-g)', color: 'white' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <SvgIcons.Target size={20} /> Qualidade Máxima
                    </h3>
                    <p style={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.6 }}>
                        Todos os julgados são revisados manualmente para garantir que o <strong>Destaque original (Tese)</strong> seja preservado integralmente, facilitando sua memorização para provas de 2ª fase.
                    </p>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.8rem', background: 'rgba(5, 150, 105, 0.1)', borderRadius: '12px', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <SvgIcons.Menu size={24} />
                        </div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Histórico de Lançamentos</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingRight: '0.5rem', maxHeight: '500px', overflowY: 'auto' }}>
                        {CHANGELOG.map((log, idx) => (
                            <div key={idx} style={{ paddingLeft: '1rem', borderLeft: '2px solid var(--border-strong)', position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '-5px', top: '5px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--accent)', background: 'var(--accent-o)', padding: '2px 6px', borderRadius: '4px' }}>{log.version}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{log.date}</span>
                                </div>
                                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.25rem' }}>{log.title}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{log.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
