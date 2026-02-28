'use client';
import { useState, useEffect } from 'react';

interface Informatory {
    court: string;
    number: string;
    year: number | null;
    lastUpdate: string;
}

export default function NovidadesClient() {
    const [data, setData] = useState<{ informatories: Informatory[], lastUpdate: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/user/informatories')
            .then(r => r.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
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

    return (
        <div className="animate-fadeIn">
            <header className="page-header" style={{ marginBottom: '3rem' }}>
                <div>
                    <h1 className="page-title">✨ Novidades e Atualizações</h1>
                    <p className="page-subtitle">Acompanhe a alimentação da nossa base de dados em tempo real.</p>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.8rem', background: 'var(--accent-g)', borderRadius: '12px', fontSize: '1.5rem' }}>📅</div>
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
                        <div style={{ padding: '0.8rem', background: 'rgba(5, 150, 105, 0.1)', borderRadius: '12px', fontSize: '1.5rem', color: '#059669' }}>📚</div>
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
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.8rem' }}>🎯 Qualidade Máxima</h3>
                    <p style={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.6 }}>
                        Todos os julgados são revisados manualmente para garantir que o <strong>Destaque original (Tese)</strong> seja preservado integralmente, facilitando sua memorização para provas de 2ª fase.
                    </p>
                </div>
            </div>
        </div>
    );
}
