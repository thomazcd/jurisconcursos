'use client';
import { useEffect, useState, useMemo } from 'react';

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

    useEffect(() => {
        fetch('/api/user/stats')
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); });
    }, []);

    const timeStats = useMemo(() => {
        if (!data) return null;
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const counts = { day: 0, week: 0, month: 0, year: 0, heatmap: {} as Record<string, number> };
        data.events.forEach(e => {
            const d = new Date(e);
            const dateStr = d.toISOString().split('T')[0];
            counts.heatmap[dateStr] = (counts.heatmap[dateStr] || 0) + 1;
            if (d >= startOfDay) counts.day++;
            if (d >= startOfWeek) counts.week++;
            if (d >= startOfMonth) counts.month++;
            if (d >= startOfYear) counts.year++;
        });
        return counts;
    }, [data]);

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-3)' }}>Analisando seu desempenho... 📊</div>;
    if (!data || !timeStats) return null;

    const hitRateTotal = (data.summary.hits + data.summary.misses) > 0
        ? Math.round((data.summary.hits / (data.summary.hits + data.summary.misses)) * 100)
        : 0;

    return (
        <div className="stats-container" style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.4s ease-out' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem', background: 'linear-gradient(90deg, var(--accent), #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>📊 Seu Painel de Performance</h1>
                <p style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>Acompanhe sua evolução e identifique pontos de foco nos informativos.</p>
            </div>

            {/* Top Summaries */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Precisão nos Simulados', val: `${hitRateTotal}%`, sub: `${data.summary.hits} acertos / ${data.summary.misses} erros`, color: '#10b981' },
                    { label: 'Informativos Lidos', val: data.summary.read, sub: `de ${data.summary.total} totais (${data.summary.percent}%)`, color: 'var(--accent)' },
                    { label: 'Ritmo Esta Semana', val: timeStats.week, sub: 'leituras realizadas', color: '#8b5cf6' },
                    { label: 'Hoje', val: timeStats.day, sub: 'leituras realizadas', color: '#3b82f6' },
                ].map(c => (
                    <div key={c.label} style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 24, border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>{c.label}</div>
                        <div style={{ fontSize: '2.4rem', fontWeight: 900, color: c.color }}>{c.val}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', fontWeight: 500, marginTop: '0.2rem' }}>{c.sub}</div>
                        <div style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.05, fontSize: '5rem', fontWeight: 900, color: c.color }}>📊</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Performance by Subject */}
                <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 24, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>📚 Foco por Matéria</h2>
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

                {/* Performance by Court & Year */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 24, border: '1px solid var(--border)' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>🏛️ Tribunais</h2>
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

                    <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 24, border: '1px solid var(--border)', flex: 1 }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem' }}>📅 Histórico por Ano</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.75rem' }}>
                            {data.byYear.map(y => (
                                <div key={y.year} style={{ padding: '0.75rem', borderRadius: 16, background: 'var(--surface2)', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.25rem' }}>{y.year}</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent)' }}>{y.read}</div>
                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>lidos</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Heatmap Section */}
            <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 24, border: '1px solid var(--border)', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>🔥 Consistência de Estudo (Últimos 35 dias)</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                    {Array.from({ length: 35 }).map((_, i) => {
                        const d = new Date(); d.setDate(d.getDate() - (34 - i));
                        const str = d.toISOString().split('T')[0];
                        const count = timeStats.heatmap[str] || 0;
                        let color = 'var(--surface2)';
                        if (count > 0) color = '#dcfce7'; if (count > 2) color = '#86efac'; if (count > 5) color = '#22c55e'; if (count > 10) color = '#166534';
                        return <div key={i} title={`${str}: ${count} leituras`} style={{ aspectRatio: '1', background: color, borderRadius: 6, border: '1px solid rgba(0,0,0,0.05)', transition: 'transform 0.2s', cursor: 'help' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'} />;
                    })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600 }}>
                    <span>Pior dia (o melhor é hoje!)</span>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <span>Menos</span>
                        {[0, 1, 3, 6, 11].map(v => {
                            let color = 'var(--surface2)';
                            if (v > 0) color = '#dcfce7'; if (v > 2) color = '#86efac'; if (v > 5) color = '#22c55e'; if (v > 10) color = '#166534';
                            return <div key={v} style={{ width: 12, height: 12, background: color, borderRadius: 3 }} />
                        })}
                        <span>Mais</span>
                    </div>
                    <span>Sua consistência é o segredo!</span>
                </div>
            </div>

            <style jsx>{` @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } `}</style>

            <div style={{ textAlign: 'center', marginTop: '2rem', padding: '2rem', fontSize: '0.7rem', color: 'var(--text-3)', opacity: 0.5 }}>
                v1.00033
            </div>
        </div>
    );
}
