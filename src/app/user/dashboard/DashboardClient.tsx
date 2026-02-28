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
    const [readMap, setReadMap] = useState<Record<string, number>>({});
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState<string | null>(null);

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
        setExpanded(null);
        const r = await fetch(`/api/user/precedents?subjectId=${subjectId}`);
        const d = await r.json();
        const precs: Precedent[] = d.precedents ?? [];
        setPrecedents(precs);
        const map: Record<string, number> = {};
        precs.forEach(p => { map[p.id] = p.readCount; });
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
        setReadMap(m => ({ ...m, [id]: d.readCount }));
    }

    async function resetRead(id: string) {
        await fetch('/api/user/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ precedentId: id, action: 'reset' }),
        });
        setReadMap(m => ({ ...m, [id]: 0 }));
    }

    const selectedSubjectName = subjects.find(s => s.id === selectedSubject)?.name ?? '';
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
                <button className="btn btn-secondary btn-sm" onClick={() => window.print()} title="Imprimir / Salvar PDF">
                    🖨️ Imprimir
                </button>
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

            {/* Print header */}
            <div className="print-only" style={{ marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>{selectedSubjectName}</h2>
                <p style={{ fontSize: '0.75rem', color: '#666' }}>{TRACK_LABELS[track]} — {new Date().toLocaleDateString('pt-BR')}</p>
                <hr />
            </div>

            {/* States */}
            {loading && <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', padding: '1rem 0' }}>Carregando…</p>}
            {!loading && filtered.length === 0 && (
                <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', padding: '1rem 0' }}>
                    {q ? `Nenhum resultado para "${search}"` : 'Nenhum precedente para esta matéria.'}
                </p>
            )}
            {!loading && q && filtered.length > 0 && (
                <p style={{ color: 'var(--text-3)', fontSize: '0.78rem', marginBottom: '0.5rem' }}>
                    {filtered.length} resultado{filtered.length > 1 ? 's' : ''} para "{search}"
                </p>
            )}

            {/* Precedent list */}
            <div className="prec-list">
                {filtered.map((p) => {
                    const count = readMap[p.id] ?? p.readCount;
                    const isRead = count > 0;
                    const isOpen = expanded === p.id;
                    const proc = [p.processClass, p.processNumber].filter(Boolean).join(' ');

                    return (
                        <div
                            key={p.id}
                            className="prec-item"
                            style={{ borderLeft: `3px solid ${isRead ? '#86efac' : '#fca5a5'}` }}
                        >
                            {/* Clickable title row */}
                            <div
                                className="prec-title"
                                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}
                                onClick={() => setExpanded(isOpen ? null : p.id)}
                            >
                                <span>{p.title}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', flexShrink: 0, marginTop: '2px' }}>
                                    {isOpen ? '▲' : '▼'}
                                </span>
                            </div>

                            {/* Expanded detail */}
                            {isOpen && (
                                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                                    {p.theme && (
                                        <div style={{ marginBottom: '0.4rem' }}>
                                            <span style={{ fontSize: '0.7rem', background: 'rgba(201,138,0,0.12)', color: '#a06e00', padding: '1px 8px', borderRadius: 20, fontWeight: 600 }}>
                                                📌 {p.theme}
                                            </span>
                                        </div>
                                    )}
                                    <div className="prec-summary" style={{ marginBottom: '0.5rem', fontWeight: 500 }}>
                                        {p.summary}
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.72rem', color: 'var(--text-3)', marginTop: '0.35rem' }}>
                                        {proc && <span>📄 {proc}</span>}
                                        {p.organ && <span>🏛 {p.organ}</span>}
                                        {p.rapporteur && <span>👤 {p.rapporteur}</span>}
                                        {p.judgmentDate && <span>📅 {new Date(p.judgmentDate).toLocaleDateString('pt-BR')}</span>}
                                        {p.informatoryNumber && <span>📰 Informativo {p.court} {p.informatoryNumber}</span>}
                                        {p.fullTextOrLink && (
                                            <a href={p.fullTextOrLink} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
                                                🔗 Texto completo
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Read controls */}
                            <div className="prec-actions no-print">
                                {!isRead ? (
                                    <button className="btn-read" onClick={() => markRead(p.id)}>Marcar lido</button>
                                ) : (
                                    <span className="read-badge">
                                        ✓ Lido {count > 1 ? `(${count}×)` : ''}
                                        <button className="btn-reset" onClick={() => resetRead(p.id)}>Zerar</button>
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
