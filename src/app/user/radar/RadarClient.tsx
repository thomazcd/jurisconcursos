'use client';
import { useState, useEffect } from 'react';
import { Icons as SvgIcons } from '@/components/ui/Icons';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface RadarData {
    subject: string;
    A: number;
    fullMark: number;
}

export default function RadarClient() {
    const [data, setData] = useState<RadarData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/user/radar')
            .then(async (r) => {
                const d = await r.json();
                if (!r.ok) throw new Error(d.error || 'Erro ao carregar radar');
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
                <div className="loader">Carregando Radar...</div>
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

    const totalReads = data.reduce((acc, curr) => acc + curr.A, 0);

    return (
        <div className="animate-fadeIn">
            <header className="page-header" style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <SvgIcons.Target size={24} style={{ color: 'var(--accent)' }} /> Meu Radar de Tendências
                    </h1>
                </div>
                <p className="page-subtitle">Acompanhe a sua distribuição de leituras por Ramo do Direito ao longo do tempo.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 2fr) minmax(300px, 1fr)', gap: '2rem' }}>

                {/* Radar Chart Section */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '2rem', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <SvgIcons.Chart size={20} color="var(--accent)" /> Análise Multidimensional
                    </h2>

                    {data.length > 2 ? (
                        <div style={{ width: '100%', height: 450, position: 'relative' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
                                    <PolarGrid stroke="var(--border-strong)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-2)', fontSize: 11, fontWeight: 700 }} />
                                    <PolarRadiusAxis />
                                    <Tooltip
                                        contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
                                        itemStyle={{ color: 'var(--accent)', fontWeight: 800 }}
                                        labelStyle={{ color: 'var(--text)', fontWeight: 900, marginBottom: '4px' }}
                                        formatter={(value: any) => [`${value} lidos`, 'Julgados']}
                                    />
                                    <Radar name="Leituras" dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.6} strokeWidth={2} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-3)' }}>
                            <SvgIcons.Book size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-2)' }}>Radar Inativo</h3>
                            <p style={{ fontSize: '0.9rem' }}>Leia teses de pelo menos 3 Ramos do Direito diferentes para gerar a teia de tendências inteligente.</p>
                        </div>
                    )}
                </div>

                {/* Insight Stats Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ background: 'var(--accent-g)', color: 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.2)', borderRadius: '10px' }}>
                                <SvgIcons.BookOpen size={24} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>Total Extraído</h3>
                                <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>{totalReads} Teses Mapeadas</div>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.85rem', opacity: 0.85, lineHeight: 1.5 }}>
                            Seu progresso é rastreado automaticamente conforme você marca os informativos como lidos no painel principal.
                        </p>
                    </div>

                    <div className="card">
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <SvgIcons.Chart size={18} /> Top Disciplicas Consumidas
                        </h3>
                        {data.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {data.slice(0, 7).map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--surface2)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-3)', width: '20px' }}>#{idx + 1}</span>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>{item.subject}</span>
                                        </div>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--accent)', background: 'var(--accent-o)', padding: '2px 8px', borderRadius: '6px' }}>
                                            {item.A}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', textAlign: 'center', padding: '1rem' }}>Sem dados suficientes computados.</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

