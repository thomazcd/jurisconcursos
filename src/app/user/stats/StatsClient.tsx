'use client';
import { useEffect, useState, useMemo } from 'react';

type StatsData = {
    summary: { total: number; read: number; percent: number };
    byCourt: {
        STF: { total: number; read: number; percent: number };
        STJ: { total: number; read: number; percent: number };
    };
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

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando estatísticas…</div>;
    if (!data || !timeStats) return null;

    return (
        <div className="stats-container" style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text)' }}>📊 Desempenho de Estudo</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Hoje', val: timeStats.day, color: '#3b82f6' },
                    { label: 'Esta Semana', val: timeStats.week, color: '#8b5cf6' },
                    { label: 'Este Mês', val: timeStats.month, color: '#10b981' },
                    { label: 'Este Ano', val: timeStats.year, color: '#f59e0b' },
                ].map(c => (
                    <div key={c.label} style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: 16, border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: c.color, marginTop: '0.5rem' }}>{c.val} <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>leituras</span></div>
                    </div>
                ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 20, border: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Progresso nos Informativos</h2>
                    {[
                        { label: 'Geral (Informativos)', ...data.summary, color: 'var(--accent)' },
                        { label: 'STF', ...data.byCourt.STF, color: '#2563eb' },
                        { label: 'STJ', ...data.byCourt.STJ, color: '#7c3aed' },
                    ].map(item => (
                        <div key={item.label} style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                <span style={{ fontWeight: 600 }}>{item.label}</span>
                                <span style={{ color: 'var(--text-3)' }}>{item.read} / {item.total} ({item.percent}%)</span>
                            </div>
                            <div style={{ height: 10, background: 'var(--surface2)', borderRadius: 20, overflow: 'hidden' }}>
                                <div style={{ width: `${item.percent}%`, height: '100%', background: item.color, borderRadius: 20, transition: 'width 1s ease-out' }} />
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 20, border: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Frequência de Estudo (Últimos 30 dias)</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginTop: '1rem' }}>
                        {Array.from({ length: 35 }).map((_, i) => {
                            const d = new Date(); d.setDate(d.getDate() - (34 - i));
                            const str = d.toISOString().split('T')[0];
                            const count = timeStats.heatmap[str] || 0;
                            let color = 'var(--surface2)';
                            if (count > 0) color = '#dcfce7'; if (count > 2) color = '#86efac'; if (count > 5) color = '#22c55e'; if (count > 10) color = '#166534';
                            return <div key={i} title={`${str}: ${count} leituras`} style={{ aspectRatio: '1', background: color, borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)' }} />;
                        })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.65rem', color: 'var(--text-3)' }}>
                        <span>Menos</span>
                        <div style={{ display: 'flex', gap: '2px' }}>
                            {[0, 1, 3, 6, 11].map(v => {
                                let color = 'var(--surface2)';
                                if (v > 0) color = '#dcfce7'; if (v > 2) color = '#86efac'; if (v > 5) color = '#22c55e'; if (v > 10) color = '#166534';
                                return <div key={v} style={{ width: 10, height: 10, background: color, borderRadius: 2 }} />
                            })}
                        </div>
                        <span>Mais</span>
                    </div>
                </div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', padding: '2rem', borderRadius: 24, color: '#fff', textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(30,58,138,0.3)' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>📜 Teses do STF e STJ</h2>
                <p style={{ opacity: 0.8, fontSize: '0.9rem', marginBottom: '1.5rem' }}>Em breve: Estatísticas detalhadas de Repetitivos, IACs e Repercussão Geral.</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                    <div><div style={{ fontSize: '1.5rem', fontWeight: 800 }}>0 / 0</div><div style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>Lidas (Geral)</div></div>
                    <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
                    <div><div style={{ fontSize: '1.5rem', fontWeight: 800 }}>0 / 0</div><div style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>Lidas (STF)</div></div>
                    <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
                    <div><div style={{ fontSize: '1.5rem', fontWeight: 800 }}>0 / 0</div><div style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>Lidas (STJ)</div></div>
                </div>
            </div>
            <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-3)', opacity: 0.5 }}>
                v1.00024
            </div>
        </div>
    );
}
