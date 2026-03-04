import React, { useMemo } from 'react';
import { Icons as SvgIcons } from '@/components/ui/Icons';
import { Precedent } from '../types';

interface DashboardOverviewProps {
    userName: string;
    stats: any;
    recommendedPrecedents: Precedent[];
    onFlashcard: (p: Precedent, choice: boolean) => void;
    revealed: Record<string, boolean>;
    results: Record<string, 'CORRECT' | 'WRONG' | null>;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
    userName, stats, recommendedPrecedents, onFlashcard, revealed, results
}) => {

    const timeStats = useMemo(() => {
        if (!stats?.events) return null;
        const now = new Date();
        const counts = {
            last7Days: [] as { date: string, count: number, label: string }[]
        };

        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const label = d.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase().replace('.', '');
            counts.last7Days.push({ date: dateStr, count: 0, label });
        }

        stats.events.forEach((e: string) => {
            const dateStr = e.split('T')[0];
            const idx = counts.last7Days.findIndex(x => x.date === dateStr);
            if (idx !== -1) counts.last7Days[idx].count++;
        });
        return counts;
    }, [stats]);

    const topSubjects = useMemo(() => {
        if (!stats?.bySubject) return [];
        return stats.bySubject.slice(0, 4);
    }, [stats]);

    return (
        <div style={{ marginBottom: '2.5rem', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', marginBottom: '4px' }}>
                    Bem-vindo, {userName}!
                </h1>
                <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', fontWeight: 500 }}>
                    {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })} • {stats?.summary?.read || 0} informativos lidos até agora.
                </p>
            </div>

            {/* Top Row: Mini Flashcards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                {recommendedPrecedents.slice(0, 3).map(p => (
                    <div key={p.id} style={{
                        background: 'var(--surface)',
                        padding: '1.25rem',
                        borderRadius: '20px',
                        border: '1px solid var(--border)',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '160px'
                    }}>
                        <div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                                {p.subjects?.[0]?.name || 'Jurisprudência'}
                            </div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.4, marginBottom: '1rem' }}>
                                {p.flashcardVf || p.thesis || p.title}
                            </div>
                        </div>

                        {revealed[p.id] ? (
                            <div style={{
                                padding: '10px',
                                borderRadius: '10px',
                                background: results[p.id] === 'CORRECT' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: results[p.id] === 'CORRECT' ? '#059669' : '#dc2626',
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                textAlign: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}>
                                {results[p.id] === 'CORRECT' ? <><SvgIcons.Check size={16} /> Acertou!</> : <><SvgIcons.X size={16} /> Errou!</>}
                                <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>— Resposta: {p.flashcardAnswer ? 'V' : 'F'}</span>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => onFlashcard(p, true)}
                                    className="btn btn-primary btn-sm"
                                    style={{ flex: 1, borderRadius: '10px', fontSize: '0.75rem' }}
                                >Verdadeiro</button>
                                <button
                                    onClick={() => onFlashcard(p, false)}
                                    className="btn btn-secondary btn-sm"
                                    style={{ flex: 1, borderRadius: '10px', fontSize: '0.75rem' }}
                                >Falso</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {/* Line Chart: Performance Semanal */}
                <div style={{
                    background: 'var(--surface)',
                    padding: '1.5rem',
                    borderRadius: '24px',
                    border: '1px solid var(--border)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
                }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <SvgIcons.Chart size={18} style={{ color: 'var(--accent)' }} /> Desempenho Semanal
                    </h3>

                    <div style={{ height: '180px', width: '100%', position: 'relative' }}>
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            {timeStats && (() => {
                                const max = Math.max(...timeStats.last7Days.map(d => d.count), 5);
                                const points = timeStats.last7Days.map((d, i) => ({
                                    x: (i / 6) * 100,
                                    y: 100 - (d.count / max) * 80 - 10
                                }));
                                const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                                const areaD = `${d} L 100 100 L 0 100 Z`;
                                return (
                                    <>
                                        <path d={areaD} fill="url(#areaGrad)" />
                                        <path d={d} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                        {points.map((p, i) => (
                                            <circle key={i} cx={p.x} cy={p.y} r="1.5" fill="var(--surface)" stroke="var(--accent)" strokeWidth="1" />
                                        ))}
                                    </>
                                );
                            })()}
                        </svg>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                            {timeStats?.last7Days.map((d, i) => (
                                <div key={i} style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-3)', textAlign: 'center', width: '14%' }}>
                                    {d.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Donut Chart Style: Tópicos Estudados */}
                <div style={{
                    background: 'var(--surface)',
                    padding: '1.5rem',
                    borderRadius: '24px',
                    border: '1px solid var(--border)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
                }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <SvgIcons.Book size={18} style={{ color: 'var(--accent)' }} /> Tópicos Estudados
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--surface2)" strokeWidth="4" />
                                {(() => {
                                    const total = topSubjects.reduce((acc: number, s: any) => acc + s.read, 0) || 1;
                                    let offset = 0;
                                    const colors = ['var(--accent)', '#2dd4bf', '#5eead4', '#99f6e4'];
                                    return topSubjects.map((s: any, i: number) => {
                                        const p = (s.read / total) * 100;
                                        const dash = `${p} ${100 - p}`;
                                        const currentOffset = offset;
                                        offset += p;
                                        return (
                                            <circle
                                                key={s.id}
                                                cx="18" cy="18" r="15.5"
                                                fill="none"
                                                stroke={colors[i % colors.length]}
                                                strokeWidth="4"
                                                strokeDasharray={dash}
                                                strokeDashoffset={-currentOffset}
                                            />
                                        );
                                    });
                                })()}
                            </svg>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text)' }}>{stats?.summary?.percent || 0}%</span>
                                <span style={{ fontSize: '0.5rem', color: 'var(--text-3)', fontWeight: 800, textTransform: 'uppercase' }}>Geral</span>
                            </div>
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {topSubjects.map((s: any, i: number) => {
                                const colors = ['var(--accent)', '#2dd4bf', '#5eead4', '#99f6e4'];
                                return (
                                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors[i % colors.length] }} />
                                        <div style={{ flex: 1, fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-3)' }}>{s.percent}%</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};
