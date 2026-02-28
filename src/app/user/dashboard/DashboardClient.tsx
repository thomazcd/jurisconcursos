'use client';
import { useEffect, useState, useCallback } from 'react';

type Subject = { id: string; name: string };
type Precedent = {
    id: string; title: string; summary: string; court: string;
    judgmentDate?: string | null; processClass?: string | null;
    processNumber?: string | null; informatoryNumber?: string | null;
    organ?: string | null; rapporteur?: string | null;
    theme?: string | null; isRG: boolean; fullTextOrLink?: string | null;
    readCount: number; isRead: boolean;
    readEvents: string[];
};

interface Props { userName: string; track: string; }

const TRACK_LABELS: Record<string, string> = {
    JUIZ_ESTADUAL: '⚖️ Juiz Estadual',
    JUIZ_FEDERAL: '🏛️ Juiz Federal',
    PROCURADOR: '📋 Procurador',
};

export default function DashboardClient({ userName, track }: Props) {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [precedents, setPrecedents] = useState<Precedent[]>([]);
    const [loading, setLoading] = useState(false);
    const [readMap, setReadMap] = useState<Record<string, { count: number, events: string[] }>>({});
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('/api/user/subjects')
            .then(r => r.json())
            .then(d => {
                const subs: Subject[] = d.subjects ?? [];
                setSubjects(subs);
                if (subs.length > 0) setSelectedSubject(subs[0].id);
            });
    }, []);

    const loadPrecedents = useCallback(async (subjectId: string) => {
        if (!subjectId) return;
        setLoading(true);
        const r = await fetch(`/api/user/precedents?subjectId=${subjectId}`);
        const d = await r.json();
        const precs: Precedent[] = d.precedents ?? [];
        setPrecedents(precs);
        const map: Record<string, { count: number, events: string[] }> = {};
        precs.forEach(p => { map[p.id] = { count: p.readCount, events: p.readEvents }; });
        setReadMap(map);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (selectedSubject) loadPrecedents(selectedSubject);
    }, [selectedSubject, loadPrecedents]);

    async function markRead(id: string) {
        const r = await fetch('/api/user/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ precedentId: id, action: 'increment' }),
        });
        const d = await r.json();
        setReadMap(m => ({ ...m, [id]: { count: d.readCount, events: d.readEvents || [] } }));
    }

    async function resetRead(id: string) {
        if (!confirm('Deseja zerar as leituras deste precedente?')) return;
        await fetch('/api/user/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ precedentId: id, action: 'reset' }),
        });
        setReadMap(m => ({ ...m, [id]: { count: 0, events: [] } }));
    }

    const q = search.trim().toLowerCase();
    const filtered = q
        ? precedents.filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.summary.toLowerCase().includes(q) ||
            (p.theme ?? '').toLowerCase().includes(q) ||
            (p.processNumber ?? '').toLowerCase().includes(q)
        )
        : precedents;

    return (
        <div>
            {/* Header */}
            <div className="page-header no-print" style={{ marginBottom: '0.75rem' }}>
                <h1 className="page-title" style={{ fontSize: '1rem' }}>{TRACK_LABELS[track] ?? track}</h1>
                <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>🖨️ Imprimir</button>
            </div>

            {/* Selectors */}
            <div className="no-print" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <select
                    value={selectedSubject}
                    onChange={e => { setSelectedSubject(e.target.value); setSearch(''); }}
                    style={{ flex: '0 0 220px', padding: '0.45rem 0.75rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: '0.85rem' }}
                >
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input
                    type="search" placeholder="Buscar…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, padding: '0.45rem 0.75rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: '0.85rem' }}
                />
            </div>

            {loading && <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', padding: '1rem 0' }}>Carregando…</p>}

            <div className="prec-list">
                {filtered.map((p) => {
                    const readData = readMap[p.id] || { count: 0, events: [] };
                    const isRead = readData.count > 0;
                    const proc = [p.processClass, p.processNumber].filter(Boolean).join(' ');

                    const hoverText = readData.events.length > 0
                        ? 'Leituras em:\n' + readData.events.map(e => new Date(e).toLocaleString('pt-BR')).join('\n')
                        : 'Ainda não lido';

                    return (
                        <div
                            key={p.id}
                            className="prec-item"
                            style={{
                                borderLeft: `3px solid ${isRead ? '#86efac' : '#fca5a5'}`,
                                padding: '0.6rem 0.75rem',
                                marginBottom: '0.5rem'
                            }}
                        >
                            {p.theme && (
                                <div style={{ marginBottom: '0.2rem' }}>
                                    <span style={{ fontSize: '0.6rem', background: 'rgba(201,138,0,0.12)', color: '#a06e00', padding: '1px 8px', borderRadius: 20, fontWeight: 600 }}>
                                        📌 {p.theme}
                                    </span>
                                </div>
                            )}
                            <div className="prec-title" style={{ marginBottom: '0.2rem', color: 'var(--text)', fontWeight: 700, fontSize: '0.95rem' }}>
                                {p.title}
                            </div>
                            <div className="prec-summary" style={{ marginBottom: '0.5rem', color: 'var(--text-2)', lineHeight: '1.4', fontSize: '0.9rem' }}>
                                {p.summary}
                            </div>

                            {/* Info + Action line (Combined) */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', borderTop: '0.5px solid var(--border)', paddingTop: '0.4rem' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', color: 'var(--text-3)' }}>
                                    {p.judgmentDate && <span>📅 {new Date(p.judgmentDate).toLocaleDateString('pt-BR')}</span>}
                                    {proc && <span>📄 {proc}</span>}
                                    {p.informatoryNumber && <span>📰 Inf {p.court} {p.informatoryNumber}</span>}
                                </div>

                                <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {!isRead ? (
                                        <button
                                            className="btn-read"
                                            style={{ padding: '2px 8px', fontSize: '0.65rem' }}
                                            onClick={() => markRead(p.id)}
                                        >
                                            Marcar lido
                                        </button>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <span
                                                title={hoverText}
                                                style={{
                                                    background: '#dcfce7',
                                                    color: '#166534',
                                                    padding: '2px 8px',
                                                    borderRadius: 4,
                                                    cursor: 'help',
                                                    fontWeight: 600
                                                }}
                                            >
                                                ✓ Lido {readData.count > 1 ? `${readData.count}×` : ''}
                                            </span>

                                            <button
                                                className="btn-read"
                                                title="Marcar leitura adicional"
                                                style={{ padding: '2px 8px', fontSize: '0.65rem', background: 'var(--surface3)', border: '1px solid var(--border)' }}
                                                onClick={() => markRead(p.id)}
                                            >
                                                +1
                                            </button>

                                            <button
                                                onClick={() => resetRead(p.id)}
                                                style={{ padding: '2px 4px', background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.65rem', cursor: 'pointer' }}
                                                title="Zerar progresso"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', padding: '1rem', fontSize: '0.65rem', color: 'var(--text-3)', opacity: 0.5 }}>
                v1.00010
            </div>
        </div>
    );
}
