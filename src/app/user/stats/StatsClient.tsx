'use client';
import { useEffect, useState, useMemo } from 'react';
import { APP_VERSION } from '@/lib/version';
import { Icons as SvgIcons } from '@/components/ui/Icons';

type SubjectStat = { id: string; name: string; total: number; read: number; hits: number; misses: number; percent: number; hitRate: number };
type StatsData = {
    summary: { total: number; read: number; hits: number; misses: number; percent: number };
    byCourt: {
        STF: { total: number; read: number; hits: number; misses: number };
        STJ: { total: number; read: number; hits: number; misses: number };
    };
    bySubject: SubjectStat[];
    byYear: { year: string; read: number; hits: number; misses: number }[];
    events: string[];
};

export default function StatsClient() {
    const [data, setData] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    const loadStats = () => {
        setLoading(true);
        fetch('/api/user/stats')
            .then(r => r.json())
            .then(d => {
                if (d.error) {
                    console.error('Stats API Error:', d.error);
                    setLoading(false);
                    return;
                }
                setData(d);
                setLoading(false);
            })
            .catch(err => {
                console.error('Stats Fetch Error:', err);
                setLoading(false);
            });
    };

    useEffect(() => {
        loadStats();
    }, []);

    async function resetAllStats() {
        if (!confirm('Deseja zerar TODAS as estatísticas de desempenho (V/F)? Esta ação não pode ser desfeita.')) return;
        try {
            await fetch('/api/user/read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'bulk_reset_stats', precedentId: 'ALL' }),
            });
            loadStats();
        } catch (err) {
            console.error(err);
            alert('Erro ao resetar estatísticas');
        }
    }

    const timeStats = useMemo(() => {
        if (!data) return null;
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const counts = {
            day: 0,
            week: 0,
            month: 0,
            year: 0,
            heatmap: {} as Record<string, number>,
            last7Days: [] as { date: string, count: number }[]
        };

        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            counts.last7Days.push({ date: d.toISOString().split('T')[0], count: 0 });
        }

        (data.events || []).forEach(e => {
            const d = new Date(e);
            const dateStr = d.toISOString().split('T')[0];
            counts.heatmap[dateStr] = (counts.heatmap[dateStr] || 0) + 1;

            const last7Idx = counts.last7Days.findIndex(x => x.date === dateStr);
            if (last7Idx !== -1) counts.last7Days[last7Idx].count++;

            if (d >= startOfDay) counts.day++;
            if (d >= startOfWeek) counts.week++;
            if (d >= startOfMonth) counts.month++;
            if (d >= startOfYear) counts.year++;
        });
        return counts;
    }, [data]);

    const streakInfo = useMemo(() => {
        if (!data || !data.events || data.events.length === 0) return { current: 0, max: 0 };
        const uniqueDates = [...new Set(data.events.map(e => e.split('T')[0]))].sort();

        let max = 0;
        let temp = 0;
        let lastDate: Date | null = null;

        uniqueDates.forEach(dateStr => {
            const d = new Date(dateStr + 'T12:00:00');
            if (!lastDate) {
                temp = 1;
            } else {
                const diff = Math.round((d.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
                if (diff === 1) temp++;
                else temp = 1;
            }
            lastDate = d;
            if (temp > max) max = temp;
        });

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const lastStudied = uniqueDates[uniqueDates.length - 1];

        let current = 0;
        if (lastStudied === today || lastStudied === yesterday) {
            let curr = 0;
            let checkDate = new Date(lastStudied + 'T12:00:00');
            for (let i = uniqueDates.length - 1; i >= 0; i--) {
                const d = new Date(uniqueDates[i] + 'T12:00:00');
                const diff = Math.round((checkDate.getTime() - d.getTime()) / (1000 * 3600 * 24));
                if (diff <= 1) {
                    curr++;
                    checkDate = d;
                } else break;
            }
            current = curr;
        }

        return { current, max };
    }, [data]);

    if (loading) return (
        <div style={{ padding: '8rem 2rem', textAlign: 'center', minHeight: '100vh', background: 'var(--background)' }}>
            <div className="skeleton-box" style={{ width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 1.5rem' }} />
            <div style={{ color: 'var(--text-3)', fontStyle: 'italic', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>Analisando seu desempenho e gerando estatísticas avançadas... <SvgIcons.Chart size={18} /></div>
        </div>
    );

    if (!data || !timeStats || !data.summary) return (
        <div style={{ padding: '8rem 2rem', textAlign: 'center', minHeight: '100vh', background: 'var(--background)', color: 'var(--text-3)' }}>
            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>Nenhum dado de desempenho encontrado para exibir no momento. <SvgIcons.Chart size={18} /></p>
            <p style={{ fontSize: '0.8rem', marginTop: '1rem' }}>Comece a ler os informativos para ver sua evolução aqui!</p>
        </div>
    );

    const hitRateTotal = (data.summary.hits + data.summary.misses) > 0
        ? Math.round((data.summary.hits / (data.summary.hits + data.summary.misses)) * 100)
        : 0;

    return (
        <div className="stats-container" style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.4s ease-out' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem', background: 'linear-gradient(90deg, var(--accent), #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <SvgIcons.Chart size={28} style={{ color: 'var(--accent)' }} /> Seu Painel de Performance
                    </h1>
                    <p style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>Acompanhe sua evolução e identifique pontos de foco nos informativos.</p>
                </div>
                <button
                    onClick={resetAllStats}
                    style={{
                        padding: '0.5rem 0.8rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: 'var(--surface)',
                        color: '#ef4444',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; }}
                >
                    <SvgIcons.RefreshCw size={14} /> Zerar Estatísticas
                </button>
            </div>

            {/* Streak & Top Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                {/* Streak Card */}
                <div className="streak-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ color: '#ffae00', background: 'rgba(255, 174, 0, 0.2)', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <SvgIcons.Fire size={36} fill="#ffae00" />
                    </div>
                    <div>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Sequência Atual</h4>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{streakInfo.current}</span>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>dias</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '8px', fontWeight: 600 }}>Recorde histórico: {streakInfo.max} dias</p>
                    </div>
                </div>

                <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    <div style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: 16, border: '1px solid var(--border)' }}>
                        <p style={{ color: 'var(--text-3)', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Lidos</p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)' }}>{data.summary.read}</h3>
                    </div>
                    <div style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: 16, border: '1px solid var(--border)' }}>
                        <p style={{ color: 'var(--text-3)', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Progresso Total</p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent)' }}>{data.summary.percent}%</h3>
                    </div>
                    <div style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: 16, border: '1px solid var(--border)' }}>
                        <p style={{ color: 'var(--text-3)', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Taxa de Acerto</p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: hitRateTotal > 70 ? '#10b981' : hitRateTotal > 40 ? '#f59e0b' : '#ef4444' }}>{hitRateTotal}%</h3>
                    </div>
                    <div style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: 16, border: '1px solid var(--border)' }}>
                        <p style={{ color: 'var(--text-3)', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Hoje</p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)' }}>{timeStats.day}</h3>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Performance by Subject */}
                <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 24, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <SvgIcons.BookOpen size={20} style={{ color: 'var(--accent)' }} /> Foco por Matéria
                        </h2>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600 }}>ORDENADO POR LEITURAS</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {data.bySubject.slice(0, 10).map(s => (
                            <div key={s.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'flex-end' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>{s.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 500 }}>{s.read} / {s.total} lidos • <span style={{ color: s.hitRate > 70 ? '#10b981' : s.hitRate > 40 ? '#f59e0b' : '#ef4444' }}>{s.hitRate}% acertos</span></div>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-2)' }}>{s.percent}%</span>
                                </div>
                                <div style={{ height: 8, background: 'var(--surface2)', borderRadius: 10, overflow: 'hidden', display: 'flex' }}>
                                    <div style={{ width: `${s.percent}%`, height: '100%', background: 'var(--accent)', borderRadius: 10 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tribunals */}
                <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 24, border: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <SvgIcons.Landmark size={20} style={{ color: 'var(--accent)' }} /> Tribunais
                    </h2>
                    {([
                        { label: 'STF - Supremo Tribunal Federal', ...data.byCourt.STF, color: '#2563eb' },
                        { label: 'STJ - Superior Tribunal de Justiça', ...data.byCourt.STJ, color: '#7c3aed' },
                    ]).map(item => {
                        const p = item.total > 0 ? Math.round((item.read / item.total) * 100) : 0;
                        const h = (item.hits + item.misses) > 0 ? Math.round((item.hits / (item.hits + item.misses)) * 100) : 0;
                        return (
                            <div key={item.label} style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)' }}>{item.label}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{item.read} de {item.total} lidos ({p}%)</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: h > 70 ? '#10b981' : h > 40 ? '#f59e0b' : '#ef4444' }}>{h}%</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>Taxa de Acerto</div>
                                    </div>
                                </div>
                                <div style={{ height: 8, background: 'var(--surface2)', borderRadius: 10, overflow: 'hidden' }}>
                                    <div style={{ width: `${p}%`, height: '100%', background: item.color, borderRadius: 10 }} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Evolution Chart (Custom SVG) */}
                <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 24, border: '1px solid var(--border)', gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <SvgIcons.Chart size={20} style={{ color: 'var(--accent)' }} /> Evolução de Estudos (Últimos 7 dias)
                        </h2>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600 }}>PICO: {Math.max(...timeStats.last7Days.map(d => d.count))} LEITURAS</span>
                    </div>

                    <div style={{ height: '220px', width: '100%', position: 'relative', marginTop: '1rem' }}>
                        <svg width="100%" height="100%" viewBox="0 0 700 200" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                                </linearGradient>
                            </defs>

                            {/* Grid Lines */}
                            {[0, 50, 100, 150, 200].map(y => (
                                <line key={y} x1="0" y1={y} x2="700" y2={y} stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
                            ))}

                            {(() => {
                                const maxVal = Math.max(...timeStats.last7Days.map(d => d.count), 5);
                                const points = timeStats.last7Days.map((d, i) => {
                                    const x = i * 115;
                                    const y = 200 - (d.count / maxVal) * 180;
                                    return { x, y, count: d.count };
                                });

                                const dPath = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
                                const areaPath = `${dPath} L ${points[points.length - 1].x},200 L 0,200 Z`;

                                return (
                                    <>
                                        <path d={areaPath} fill="url(#chartGradient)" />
                                        <path d={dPath} fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 0.5s ease' }} />
                                        {points.map((p, i) => (
                                            <g key={i}>
                                                <circle cx={p.x} cy={p.y} r="6" fill="var(--surface)" stroke="var(--accent)" strokeWidth="3" />
                                                <text x={p.x} y={p.y - 15} textAnchor="middle" fill="var(--text)" fontSize="12" fontWeight="800">{p.count}</text>
                                                <text x={p.x} y="225" textAnchor="middle" fill="var(--text-3)" fontSize="10" fontWeight="700">
                                                    {new Date(timeStats.last7Days[i].date).toLocaleDateString('pt-BR', { weekday: 'short' })}
                                                </text>
                                            </g>
                                        ))}
                                    </>
                                );
                            })()}
                        </svg>
                    </div>
                </div>
            </div>

            {/* Consistência */}
            <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 24, border: '1px solid var(--border)', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <SvgIcons.Calendar size={20} style={{ color: 'var(--accent)' }} /> Consistência de Estudo (Últimos 35 dias)
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                    {Array.from({ length: 35 }).map((_, i) => {
                        const d = new Date(); d.setDate(d.getDate() - (34 - i));
                        const str = d.toISOString().split('T')[0];
                        const count = timeStats.heatmap[str] || 0;
                        let color = 'var(--surface2)';
                        if (count > 0) color = 'rgba(20, 184, 166, 0.2)';
                        if (count > 2) color = 'rgba(20, 184, 166, 0.4)';
                        if (count > 5) color = 'rgba(20, 184, 166, 0.7)';
                        if (count > 10) color = 'var(--accent)';
                        return <div key={i} title={`${str}: ${count} leituras`} style={{ aspectRatio: '1', background: color, borderRadius: 6, transition: 'all 0.2s' }} />;
                    })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem', fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600 }}>
                    <span>Mais antigo</span>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <span>Menos</span>
                        {[0, 1, 3, 6, 11].map(v => {
                            let color = 'var(--surface2)';
                            if (v > 0) color = 'rgba(20, 184, 166, 0.2)';
                            if (v > 2) color = 'rgba(20, 184, 166, 0.4)';
                            if (v > 5) color = 'rgba(20, 184, 166, 0.7)';
                            if (v > 10) color = 'var(--accent)';
                            return <div key={v} style={{ width: 12, height: 12, background: color, borderRadius: 3 }} />
                        })}
                        <span>Mais</span>
                    </div>
                    <span>Hoje</span>
                </div>
            </div>

            <style jsx>{` @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } `}</style>

            <div style={{ textAlign: 'center', marginTop: '2rem', padding: '2rem', fontSize: '0.7rem', color: 'var(--text-3)', opacity: 0.5 }}>
                v{APP_VERSION} · Desenvolvido por Thomaz C. Drumond
            </div>
        </div>
    );
}
