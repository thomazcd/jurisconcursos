'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';

type Subject = { id: string; name: string; total: number; readCount: number; unreadCount: number };
type Precedent = {
    id: string; title: string; summary: string; court: string;
    judgmentDate?: string | null; publicationDate?: string | null;
    processClass?: string | null; processNumber?: string | null;
    informatoryNumber?: string | null; organ?: string | null;
    theme?: string | null; isRG: boolean; fullTextOrLink?: string | null;
    readCount: number; isRead: boolean; readEvents: string[];
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
    const [studyMode, setStudyMode] = useState<'READ' | 'FLASHCARD'>('READ');
    const [filterHideRead, setFilterHideRead] = useState(false);
    const [courtFilter, setCourtFilter] = useState<'ALL' | 'STF' | 'STJ'>('ALL');
    const [revealed, setRevealed] = useState<Record<string, boolean>>({});

    const loadSubjects = useCallback(() => {
        fetch('/api/user/subjects')
            .then(r => r.json())
            .then(d => {
                const subs: Subject[] = d.subjects ?? [];
                setSubjects(subs);
                if (subs.length > 0 && !selectedSubject) setSelectedSubject(subs[0].id);
            });
    }, [selectedSubject]);

    useEffect(() => { loadSubjects(); }, [loadSubjects]);

    const loadPrecedents = useCallback(async (subjectId: string) => {
        if (!subjectId) return;
        setLoading(true);
        setRevealed({});
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
        loadSubjects();
    }

    async function resetRead(id: string) {
        if (!confirm('Deseja zerar as leituras deste precedente?')) return;
        await fetch('/api/user/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ precedentId: id, action: 'reset' }),
        });
        setReadMap(m => ({ ...m, [id]: { count: 0, events: [] } }));
        loadSubjects();
    }

    const currentSub = subjects.find(s => s.id === selectedSubject);
    const progressPercent = currentSub && currentSub.total > 0
        ? Math.round((currentSub.readCount / currentSub.total) * 100)
        : 0;

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return precedents.filter(p => {
            const count = readMap[p.id]?.count ?? p.readCount;
            if (filterHideRead && count > 0) return false;
            if (courtFilter !== 'ALL' && p.court !== courtFilter) return false;
            if (!q) return true;
            return p.title.toLowerCase().includes(q) ||
                p.summary.toLowerCase().includes(q) ||
                (p.theme ?? '').toLowerCase().includes(q);
        });
    }, [precedents, search, filterHideRead, courtFilter, readMap]);

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="page-header no-print" style={{ marginBottom: '1rem' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '1.1rem' }}>{TRACK_LABELS[track] ?? track}</h1>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '2px' }}>
                        Bem-vindo de volta, {userName}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className={`btn btn-sm ${studyMode === 'READ' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStudyMode('READ')}>📖 Leitura</button>
                    <button className={`btn btn-sm ${studyMode === 'FLASHCARD' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStudyMode('FLASHCARD')}>🧠 Treino</button>
                </div>
            </div>

            {/* Selectors & Filters */}
            <div className="no-print" style={{ background: 'var(--surface2)', padding: '0.75rem', borderRadius: 12, marginBottom: '1rem', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <select
                        value={selectedSubject}
                        onChange={e => setSelectedSubject(e.target.value)}
                        style={{ flex: '0 0 240px', padding: '0.5rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '0.85rem' }}
                    >
                        {subjects.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.name} ({Math.round((s.readCount / s.total) * 100 || 0)}%)
                            </option>
                        ))}
                    </select>
                    <input
                        type="search" placeholder="Filtrar nesta matéria…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ flex: 1, padding: '0.5rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '0.85rem' }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', background: 'var(--surface)', padding: '2px', borderRadius: 8, border: '1px solid var(--border)' }}>
                            {(['ALL', 'STF', 'STJ'] as const).map(c => (
                                <button key={c} onClick={() => setCourtFilter(c)} style={{ padding: '4px 12px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600, border: 'none', background: courtFilter === c ? 'var(--accent)' : 'transparent', color: courtFilter === c ? '#fff' : 'var(--text-3)', cursor: 'pointer' }}>
                                    {c === 'ALL' ? 'Todos' : c}
                                </button>
                            ))}
                        </div>
                        <button className={`btn-tag ${filterHideRead ? 'active' : ''}`} onClick={() => setFilterHideRead(!filterHideRead)} style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border)', background: filterHideRead ? 'var(--accent)' : 'transparent', color: filterHideRead ? '#fff' : 'var(--text-2)' }}>
                            🚫 Ocultar Lidos
                        </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-3)', background: 'var(--surface)', padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border)' }}>
                            {filtered.length} julgados
                        </div>
                        {currentSub && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: 100, height: 6, background: 'var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                                    <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s' }} />
                                </div>
                                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-2)' }}>{progressPercent}%</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="prec-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {filtered.map((p) => {
                    const readData = readMap[p.id] || { count: 0, events: [] };
                    const isRead = readData.count > 0;
                    const isRevealed = studyMode === 'READ' || revealed[p.id];
                    const proc = [p.processClass, p.processNumber].filter(Boolean).join(' ');

                    return (
                        <div key={p.id} className="prec-item" style={{ borderLeft: `4px solid ${isRead ? '#22c55e' : '#ef4444'}`, padding: '0.75rem', borderRadius: '0 8px 8px 0', background: 'var(--surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            {p.theme && (
                                <div style={{ marginBottom: '0.25rem' }}>
                                    <span style={{ fontSize: '0.6rem', background: 'rgba(201,138,0,0.1)', color: '#a06e00', padding: '1px 8px', borderRadius: 20, fontWeight: 700 }}>
                                        📌 {p.theme}
                                    </span>
                                </div>
                            )}
                            <div className="prec-title" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem' }}>
                                {p.title}
                            </div>

                            {!isRevealed ? (
                                <button onClick={() => setRevealed(prev => ({ ...prev, [p.id]: true }))} style={{ width: '100%', padding: '0.75rem', background: 'var(--surface2)', border: '1px dashed var(--border)', borderRadius: 6, color: 'var(--accent)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, marginBottom: '0.5rem' }}>
                                    👀 Revelar Tese
                                </button>
                            ) : (
                                <div className="prec-summary" style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: '1.45', marginBottom: '0.6rem', animation: 'fadeIn 0.2s ease-out' }}>
                                    {p.summary}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.5rem', fontSize: '0.7rem' }}>
                                <div style={{ display: 'flex', gap: '0.8rem', color: 'var(--text-3)' }}>
                                    {p.publicationDate && (
                                        <span title="Data de Publicação (DJEN/DJe)" style={{ cursor: 'help' }}>
                                            📢 {new Date(p.publicationDate).toLocaleDateString('pt-BR')}
                                        </span>
                                    )}
                                    {p.judgmentDate && (
                                        <span title="Data do Julgamento" style={{ cursor: 'help' }}>
                                            ⚖️ {new Date(p.judgmentDate).toLocaleDateString('pt-BR')}
                                        </span>
                                    )}
                                    {proc && <span>📄 {proc}</span>}
                                    {p.informatoryNumber && <span>📰 {p.court} {p.informatoryNumber}</span>}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <span title={readData.events.length > 0 ? 'Lido em:\n' + readData.events.map(e => new Date(e).toLocaleString('pt-BR')).join('\n') : 'Não lido'} style={{ background: isRead ? '#dcfce7' : '#fee2e2', color: isRead ? '#166534' : '#991b1b', padding: '2px 8px', borderRadius: 4, fontWeight: 700, cursor: 'help' }}>
                                        {isRead ? `✓ ${readData.count}×` : 'Não lido'}
                                    </span>
                                    <button className="btn-read" style={{ padding: '2px 8px' }} onClick={() => markRead(p.id)} title="Marcar leitura (+1)">+1</button>
                                    {isRead && <button onClick={() => resetRead(p.id)} style={{ border: 'none', background: 'transparent', color: '#ef4444', padding: '0 4px', cursor: 'pointer' }}>✕</button>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style jsx>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
                .btn-tag { transition: all 0.2s ease; cursor: pointer; }
                .btn-tag:hover { border-color: var(--accent); }
            `}</style>

            <div style={{ textAlign: 'center', marginTop: '2rem', padding: '2rem', fontSize: '0.65rem', color: 'var(--text-3)', opacity: 0.5 }}>
                Juris Concursos v1.00013 — Datas DJEN/Julgado Integradas 📅
            </div>
        </div>
    );
}
