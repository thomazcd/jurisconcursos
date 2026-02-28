'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';

type Subject = { id: string; name: string; total: number; readCount: number; unreadCount: number };
type Precedent = {
    id: string; title: string; summary: string; court: string;
    judgmentDate?: string | null; publicationDate?: string | null;
    processClass?: string | null; processNumber?: string | null;
    informatoryNumber?: string | null; informatoryYear?: number | null;
    organ?: string | null; rapporteur?: string | null;
    theme?: string | null; isRG: boolean; fullTextOrLink?: string | null;
    readCount: number; isRead: boolean; readEvents: string[];
    subjectId: string;
    subject?: { name: string };
    // Flashcard fields
    flashcardQuestion?: string | null;
    flashcardAnswer?: boolean;
    // Performance fields
    correctCount?: number;
    wrongCount?: number;
    lastResult?: 'HIT' | 'MISS' | null;
};

interface Props { userName: string; track: string; }

const TRACK_LABELS: Record<string, string> = {
    JUIZ_ESTADUAL: '⚖️ Juiz Estadual',
    JUIZ_FEDERAL: '🏛️ Juiz Federal',
    PROCURADOR: '📋 Procurador',
};

export default function DashboardClient({ userName, track }: Props) {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubject, setSelectedSubject] = useState('ALL');
    const [precedents, setPrecedents] = useState<Precedent[]>([]);
    const [loading, setLoading] = useState(false);
    const [readMap, setReadMap] = useState<Record<string, { count: number, events: string[], correct: number, wrong: number, last: string | null }>>({});
    const [search, setSearch] = useState('');
    const [studyMode, setStudyMode] = useState<'READ' | 'FLASHCARD'>('READ');
    const [filterHideRead, setFilterHideRead] = useState(false);
    const [filterOnlyErrors, setFilterOnlyErrors] = useState(false);
    const [courtFilter, setCourtFilter] = useState<'ALL' | 'STF' | 'STJ'>('ALL');
    const [yearFilter, setYearFilter] = useState<string>('ALL');
    const [infFilter, setInfFilter] = useState<string>('ALL');
    const [revealed, setRevealed] = useState<Record<string, boolean>>({});
    const [copying, setCopying] = useState<string | null>(null);
    const [flashcardResults, setFlashcardResults] = useState<Record<string, 'CORRECT' | 'WRONG' | null>>({});

    // User Preferences
    const [fontSize, setFontSize] = useState(14); // default base font size in px

    const [selectedPrecedent, setSelectedPrecedent] = useState<Precedent | null>(null);

    const loadSubjects = useCallback(() => {
        fetch('/api/user/subjects')
            .then(r => r.json())
            .then(d => {
                const subs: Subject[] = d.subjects ?? [];
                setSubjects(subs);
            });
    }, []);

    useEffect(() => { loadSubjects(); }, [loadSubjects]);

    const loadPrecedents = useCallback(async (subjectId: string) => {
        setLoading(true);
        setRevealed({});
        setFlashcardResults({});
        const url = subjectId === 'ALL' ? '/api/user/precedents' : `/api/user/precedents?subjectId=${subjectId}`;
        const r = await fetch(url);
        const d = await r.json();
        const precs: Precedent[] = d.precedents ?? [];
        setPrecedents(precs);
        const map: Record<string, { count: number, events: string[], correct: number, wrong: number, last: string | null }> = {};
        precs.forEach(p => {
            map[p.id] = {
                count: p.readCount,
                events: p.readEvents,
                correct: p.correctCount ?? 0,
                wrong: p.wrongCount ?? 0,
                last: p.lastResult ?? null
            };
        });
        setReadMap(map);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadPrecedents(selectedSubject);
    }, [selectedSubject, loadPrecedents]);

    const availableYears = useMemo(() => {
        const years = new Set<string>();
        precedents.forEach(p => {
            if (p.informatoryYear) years.add(p.informatoryYear.toString());
            else if (p.judgmentDate) years.add(new Date(p.judgmentDate).getFullYear().toString());
        });
        return Array.from(years).sort((a, b) => b.localeCompare(a));
    }, [precedents]);

    const availableInfs = useMemo(() => {
        const infs = new Set<string>();
        precedents.forEach(p => {
            if (p.informatoryNumber) infs.add(p.informatoryNumber);
        });
        return Array.from(infs).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
    }, [precedents]);

    async function markRead(id: string) {
        const r = await fetch('/api/user/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ precedentId: id, action: 'increment' }),
        });
        const d = await r.json();
        setReadMap(m => ({
            ...m,
            [id]: {
                ...m[id],
                count: d.readCount,
                events: d.readEvents || []
            }
        }));
        loadSubjects();
    }

    async function handleFlashcard(p: Precedent, userChoice: boolean) {
        const isCorrectResult = userChoice === (p.flashcardAnswer ?? true);
        setFlashcardResults(prev => ({ ...prev, [p.id]: isCorrectResult ? 'CORRECT' : 'WRONG' }));
        setRevealed(prev => ({ ...prev, [p.id]: true }));

        const r = await fetch('/api/user/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ precedentId: p.id, action: 'flashcard', isCorrect: isCorrectResult }),
        });
        const d = await r.json();

        setReadMap(m => ({
            ...m,
            [p.id]: {
                ...m[p.id],
                count: d.readCount,
                correct: d.correctCount,
                wrong: d.wrongCount,
                last: d.lastResult
            }
        }));
        loadSubjects();
    }

    async function decrementRead(id: string) {
        const r = await fetch('/api/user/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ precedentId: id, action: 'decrement' }),
        });
        const d = await r.json();
        setReadMap(m => ({
            ...m,
            [id]: {
                ...m[id],
                count: d.readCount,
                events: d.readEvents || []
            }
        }));
        loadSubjects();
    }

    async function resetRead(id: string) {
        if (!confirm('Deseja zerar o progresso deste precedente?')) return;
        await fetch('/api/user/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ precedentId: id, action: 'reset' }),
        });
        setReadMap(m => ({ ...m, [id]: { count: 0, events: [], correct: 0, wrong: 0, last: null } }));
        loadSubjects();
    }

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopying(id);
        setTimeout(() => setCopying(null), 2000);
    };

    const currentSub = subjects.find(s => s.id === selectedSubject);
    const progressPercent = selectedSubject === 'ALL'
        ? (subjects.reduce((acc, s) => acc + s.total, 0) > 0 ? Math.round((subjects.reduce((acc, s) => acc + s.readCount, 0) / subjects.reduce((acc, s) => acc + s.total, 0)) * 100) : 0)
        : (currentSub && currentSub.total > 0 ? Math.round((currentSub.readCount / currentSub.total) * 100) : 0);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return precedents.filter(p => {
            const readData = readMap[p.id] || { count: 0, events: [], correct: 0, wrong: 0, last: null };
            if (filterHideRead && readData.count > 0) return false;
            if (filterOnlyErrors && readData.last !== 'MISS') return false;
            if (courtFilter !== 'ALL' && p.court !== courtFilter) return false;

            if (yearFilter !== 'ALL') {
                const pYear = p.informatoryYear?.toString() || (p.judgmentDate ? new Date(p.judgmentDate).getFullYear().toString() : '');
                if (pYear !== yearFilter) return false;
            }
            if (infFilter !== 'ALL' && p.informatoryNumber !== infFilter) return false;

            if (!q) return true;
            return p.title.toLowerCase().includes(q) ||
                p.summary.toLowerCase().includes(q) ||
                (p.theme ?? '').toLowerCase().includes(q);
        });
    }, [precedents, search, filterHideRead, courtFilter, yearFilter, infFilter, readMap]);

    // Grouping for "All Subjects" view
    const groupedPrecedents = useMemo(() => {
        if (selectedSubject !== 'ALL' || search.trim() !== '' || yearFilter !== 'ALL' || infFilter !== 'ALL' || courtFilter !== 'ALL') return null;

        const groups: Record<string, Precedent[]> = {};
        filtered.forEach(p => {
            const subName = p.subject?.name || 'Geral';
            if (!groups[subName]) groups[subName] = [];
            groups[subName].push(p);
        });

        return Object.entries(groups)
            .filter(([_, list]) => list.length > 0)
            .sort(([a], [b]) => a.localeCompare(b));
    }, [selectedSubject, filtered, search, yearFilter, infFilter, courtFilter]);

    const renderPrecedent = (p: Precedent) => {
        const readData = readMap[p.id] || { count: 0, events: [], correct: 0, wrong: 0, last: null };
        const isRead = readData.count > 0;
        const isRevealed = studyMode === 'READ' || revealed[p.id];
        const proc = [p.processClass, p.processNumber].filter(Boolean).join(' ');
        const flashResult = flashcardResults[p.id];

        return (
            <div
                key={p.id}
                className="prec-item"
                style={{ borderLeft: `4px solid ${isRead ? '#22c55e' : '#ef4444'}`, padding: '0.75rem', borderRadius: '0 8px 8px 0', background: 'var(--surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s', marginBottom: '0.6rem' }}
                onClick={() => setSelectedPrecedent(p)}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {p.theme && (
                            <span style={{ fontSize: '0.7em', background: 'rgba(201,138,0,0.1)', color: '#a06e00', padding: '1px 8px', borderRadius: 20, fontWeight: 700 }}>
                                📌 {p.theme}
                            </span>
                        )}
                        {readData.last === 'HIT' && <span style={{ fontSize: '0.7em', background: '#dcfce7', color: '#166534', padding: '1px 8px', borderRadius: 20, fontWeight: 700 }}>✅ Dominado</span>}
                        {readData.last === 'MISS' && <span style={{ fontSize: '0.7em', background: '#fee2e2', color: '#991b1b', padding: '1px 8px', borderRadius: 20, fontWeight: 700 }}>⚠️ Revisar</span>}
                    </div>
                </div>

                <div className="prec-title" style={{ fontSize: '1.05em', fontWeight: 700, color: 'var(--text)', marginBottom: '0.6rem', lineHeight: '1.3', whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
                    {p.title}
                </div>

                {!isRevealed && studyMode === 'FLASHCARD' ? (
                    <div style={{ background: 'var(--surface2)', padding: '1rem', borderRadius: 12, border: '1px solid var(--border)', marginBottom: '0.6rem' }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Afirmação:</div>
                        <div style={{ fontSize: '1em', color: 'var(--text)', fontWeight: 500, marginBottom: '1rem', lineHeight: '1.4' }}>
                            {p.flashcardQuestion || p.summary}
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleFlashcard(p, true); }}
                                className="btn btn-sm"
                                style={{ flex: 1, background: '#dcfce7', color: '#166534', border: '1px solid #16653450', fontWeight: 800 }}
                            >
                                VERDADEIRO
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleFlashcard(p, false); }}
                                className="btn btn-sm"
                                style={{ flex: 1, background: '#fee2e2', color: '#991b1b', border: '1px solid #991b1b50', fontWeight: 800 }}
                            >
                                FALSO
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="prec-summary-container" style={{ position: 'relative' }}>
                        {flashResult && (
                            <div style={{
                                padding: '0.5rem 1rem',
                                marginBottom: '0.6rem',
                                borderRadius: 8,
                                background: flashResult === 'CORRECT' ? '#dcfce7' : '#fee2e2',
                                color: flashResult === 'CORRECT' ? '#166534' : '#991b1b',
                                fontWeight: 800,
                                fontSize: '0.9em',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                animation: 'fadeIn 0.2s ease-out'
                            }}>
                                {flashResult === 'CORRECT' ? '🎯 ACERTOU!' : '❌ ERROU!'}
                            </div>
                        )}
                        <div className="prec-summary" style={{ fontSize: '0.95em', color: 'var(--text-2)', lineHeight: '1.5', marginBottom: '0.6rem', animation: 'fadeIn 0.2s ease-out' }}>
                            {p.summary}
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.5rem', fontSize: '0.75em' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', color: 'var(--text-3)', alignItems: 'center' }}>
                        <span title={p.publicationDate ? 'Data de Publicação (DJEN/DJe)' : 'Não há informação de publicação quando divulgado o informativo'} style={{ cursor: 'help', opacity: p.publicationDate ? 1 : 0.4 }}>
                            📢 {p.publicationDate ? new Date(p.publicationDate).toLocaleDateString('pt-BR') : '---'}
                        </span>
                        <span title={p.judgmentDate ? 'Data do Julgamento' : 'Data de julgamento não disponível'} style={{ cursor: 'help', opacity: p.judgmentDate ? 1 : 0.4 }}>
                            ⚖️ {p.judgmentDate ? new Date(p.judgmentDate).toLocaleDateString('pt-BR') : '---'}
                        </span>
                        {proc && (
                            <span
                                onClick={(e) => { e.stopPropagation(); copyToClipboard(proc, p.id); }}
                                style={{
                                    cursor: 'copy',
                                    padding: '2px 6px',
                                    background: copying === p.id ? 'var(--accent)' : 'var(--surface2)',
                                    color: copying === p.id ? '#fff' : 'inherit',
                                    borderRadius: 4,
                                    transition: 'all 0.2s'
                                }}
                                title="Clique para copiar"
                            >
                                📄 {copying === p.id ? 'Copiado!' : proc}
                            </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            📰 {p.court} {p.informatoryNumber}{p.informatoryYear ? `/${p.informatoryYear}` : ''}
                        </span>
                        {(readData.correct > 0 || readData.wrong > 0) && (
                            <span style={{ color: 'var(--text-3)', background: 'var(--surface2)', padding: '2px 6px', borderRadius: 4 }}>
                                📊 {readData.correct}V | {readData.wrong}F
                            </span>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: isRead ? '#dcfce7' : '#fee2e2', borderRadius: 4, overflow: 'hidden' }}>
                            <span
                                title={readData.events.length > 0 ? 'Lido em:\n' + readData.events.map(e => new Date(e).toLocaleString('pt-BR')).join('\n') : 'Não lido'}
                                style={{ padding: '2px 8px', color: isRead ? '#166534' : '#991b1b', fontWeight: 700, cursor: 'help', fontSize: '1em' }}
                            >
                                {isRead ? `✓ ${readData.count}×` : 'Não lido'}
                            </span>
                            {isRead && (
                                <button
                                    onClick={() => decrementRead(p.id)}
                                    style={{ border: 'none', background: 'rgba(22,101,52,0.1)', color: '#166534', padding: '2px 6px', cursor: 'pointer', fontWeight: 800, fontSize: '0.8em', borderLeft: '1px solid rgba(22,101,52,0.2)' }}
                                    title="Diminuir leitura (-1)"
                                >
                                    -1
                                </button>
                            )}
                        </div>
                        {studyMode === 'READ' && (
                            <button
                                className="btn-read"
                                style={{ padding: '2px 10px', fontWeight: 600, fontSize: '0.65rem' }}
                                onClick={() => markRead(p.id)}
                                title={isRead ? "Marcar mais uma leitura (+1)" : "Marcar como lido"}
                            >
                                {isRead ? '+1' : 'Ler'}
                            </button>
                        )}
                        {isRead && (
                            <button
                                onClick={() => resetRead(p.id)}
                                style={{ border: 'none', background: 'transparent', color: '#ef4444', padding: '0 4px', cursor: 'pointer', opacity: 0.6 }}
                                title="Zerar progresso"
                            >
                                🗑️
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="dashboard-container" style={{ fontSize: `${fontSize}px` }}>
            {selectedPrecedent && (
                <div className="modal-overlay" onClick={() => setSelectedPrecedent(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Detalhes do Julgado</h2>
                            <button onClick={() => setSelectedPrecedent(null)} className="btn-close">✕</button>
                        </div>
                        <div className="modal-body" style={{ fontSize: `${fontSize}px` }}>
                            <h3 style={{ fontSize: '1.2em', fontWeight: 700, marginBottom: '1rem', color: 'var(--text)', whiteSpace: 'normal', overflowWrap: 'anywhere' }}>{selectedPrecedent.title}</h3>
                            {selectedPrecedent.theme && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '0.8em', background: 'rgba(201,138,0,0.1)', color: '#b47b00', padding: '4px 12px', borderRadius: 20, fontWeight: 700 }}>
                                        📌 {selectedPrecedent.theme}
                                    </span>
                                </div>
                            )}
                            <div className="summary-scrollable" style={{ padding: '1rem', background: 'var(--surface2)', borderRadius: 12, marginBottom: '1.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                                <div style={{ fontSize: '1em', lineHeight: '1.6', color: 'var(--text-1)' }}>{selectedPrecedent.summary}</div>
                            </div>
                            <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9em' }}>
                                <div className="detail-item">
                                    <span style={{ color: 'var(--text-3)', display: 'block' }}>Tribunal</span>
                                    <span style={{ fontWeight: 600 }}>{selectedPrecedent.court}</span>
                                </div>
                                <div className="detail-item">
                                    <span style={{ color: 'var(--text-3)', display: 'block' }}>Órgão Julgador</span>
                                    <span style={{ fontWeight: 600 }}>{selectedPrecedent.organ || '---'}</span>
                                </div>
                                <div className="detail-item">
                                    <span style={{ color: 'var(--text-3)', display: 'block' }}>Relator</span>
                                    <span style={{ fontWeight: 600 }}>{selectedPrecedent.rapporteur || '---'}</span>
                                </div>
                                <div className="detail-item">
                                    <span style={{ color: 'var(--text-3)', display: 'block' }}>Identificador</span>
                                    <span
                                        onClick={() => [selectedPrecedent.processClass, selectedPrecedent.processNumber].filter(Boolean).join(' ') && copyToClipboard([selectedPrecedent.processClass, selectedPrecedent.processNumber].filter(Boolean).join(' '), 'modal')}
                                        style={{ fontWeight: 600, cursor: 'copy', color: copying === 'modal' ? 'var(--accent)' : 'inherit' }}
                                    >
                                        {[selectedPrecedent.processClass, selectedPrecedent.processNumber].filter(Boolean).join(' ') || '---'}
                                        {copying === 'modal' && <span style={{ fontSize: '0.7em', marginLeft: '0.5rem', color: 'var(--accent)' }}>(Copiado!)</span>}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span style={{ color: 'var(--text-3)', display: 'block' }}>Informativo</span>
                                    <span style={{ fontWeight: 600 }}>{selectedPrecedent.informatoryNumber}{selectedPrecedent.informatoryYear ? ` / ${selectedPrecedent.informatoryYear}` : ''}</span>
                                </div>
                                <div className="detail-item">
                                    <span style={{ color: 'var(--text-3)', display: 'block' }}>Publicação</span>
                                    <span style={{ fontWeight: 600 }}>{selectedPrecedent.publicationDate ? new Date(selectedPrecedent.publicationDate).toLocaleDateString('pt-BR') : '---'}</span>
                                </div>
                                <div className="detail-item">
                                    <span style={{ color: 'var(--text-3)', display: 'block' }}>Julgamento</span>
                                    <span style={{ fontWeight: 600 }}>{selectedPrecedent.judgmentDate ? new Date(selectedPrecedent.judgmentDate).toLocaleDateString('pt-BR') : '---'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            {selectedPrecedent.fullTextOrLink && (
                                <a href={selectedPrecedent.fullTextOrLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ fontSize: '0.9em' }}>🔗 Abrir Informativo Completo</a>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="page-header no-print" style={{ marginBottom: '1rem' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '1.1rem' }}>{TRACK_LABELS[track] ?? track}</h1>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '2px' }}>
                        Bem-vindo de volta, {userName}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '4px', background: 'var(--surface2)', borderRadius: 8, marginRight: '0.5rem', border: '1px solid var(--border)' }}>
                        <button className="btn btn-ghost btn-xs" onClick={() => setFontSize(f => Math.max(10, f - 2))} title="Diminuir fonte" style={{ minWidth: 24, padding: 0 }}>A-</button>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-3)', minWidth: 20, textAlign: 'center' }}>{fontSize}</span>
                        <button className="btn btn-ghost btn-xs" onClick={() => setFontSize(f => Math.min(24, f + 2))} title="Aumentar fonte" style={{ minWidth: 24, padding: 0 }}>A+</button>
                    </div>
                    <button className={`btn btn-sm ${studyMode === 'READ' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStudyMode('READ')}>📖 Leitura</button>
                    <button className={`btn btn-sm ${studyMode === 'FLASHCARD' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStudyMode('FLASHCARD')}>🧠 Simulado V/F</button>
                </div>
            </div>

            {/* Selectors & Filters */}
            <div className="no-print" style={{ background: 'var(--surface2)', padding: '0.75rem', borderRadius: 12, marginBottom: '1rem', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <select
                        value={selectedSubject}
                        onChange={e => { setSelectedSubject(e.target.value); setYearFilter('ALL'); setInfFilter('ALL'); }}
                        style={{ flex: '0 0 220px', padding: '0.5rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '0.85rem' }}
                    >
                        <option value="ALL">📚 Todas as Matérias</option>
                        {subjects.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                    <select
                        value={yearFilter}
                        onChange={e => setYearFilter(e.target.value)}
                        style={{ flex: '0 0 100px', padding: '0.5rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '0.85rem' }}
                    >
                        <option value="ALL">Ano</option>
                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select
                        value={infFilter}
                        onChange={e => setInfFilter(e.target.value)}
                        style={{ flex: '0 0 120px', padding: '0.5rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '0.85rem' }}
                    >
                        <option value="ALL">Informativo</option>
                        {availableInfs.map(inf => <option key={inf} value={inf}>Inf {inf}</option>)}
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
                        <button className={`btn-tag ${filterHideRead ? 'active' : ''}`} onClick={() => { setFilterHideRead(!filterHideRead); setFilterOnlyErrors(false); }} style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border)', background: filterHideRead ? 'var(--accent)' : 'transparent', color: filterHideRead ? '#fff' : 'var(--text-2)' }}>
                            🚫 Ocultar Lidos
                        </button>
                        <button className={`btn-tag ${filterOnlyErrors ? 'active' : ''}`} onClick={() => { setFilterOnlyErrors(!filterOnlyErrors); setFilterHideRead(false); }} style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border)', background: filterOnlyErrors ? 'var(--rose)' : 'transparent', color: filterOnlyErrors ? '#fff' : 'var(--text-2)' }}>
                            ❌ Ver Erros
                        </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-3)', background: 'var(--surface)', padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border)' }}>
                            {filtered.length} julgados
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 100, height: 6, background: 'var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                                <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s' }} />
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-2)' }}>{progressPercent}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="prec-list">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-3)' }}>Carregando julgados...</div>
                ) : groupedPrecedents ? (
                    groupedPrecedents.map(([subName, list]) => (
                        <div key={subName} style={{ marginBottom: '1.5rem' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                marginBottom: '1rem',
                                padding: '0.5rem 1rem',
                                background: 'var(--surface2)',
                                borderRadius: 12,
                                border: '1px solid var(--border)'
                            }}>
                                <span style={{ fontSize: '1rem' }}>📚</span>
                                <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{subName}</h2>
                                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)' }}>{list.length} julgados</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {list.map(renderPrecedent)}
                            </div>
                        </div>
                    ))
                ) : filtered.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {filtered.map(renderPrecedent)}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-3)', background: 'var(--surface)', borderRadius: 12, border: '1px dashed var(--border)' }}>
                        Nenhum julgado encontrado para estes filtros.
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 2rem; }
                .modal-content { background: var(--surface); width: 100%; max-width: 800px; border-radius: 24px; box-shadow: 0 30px 60px -12px rgba(0,0,0,0.25); animation: scaleIn 0.2s ease-out; display: flex; flex-direction: column; border: 1px solid var(--border); overflow: hidden; }
                .modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: var(--surface2); }
                .modal-body { padding: 2rem; overflow-y: auto; }
                .modal-footer { padding: 1.5rem 2rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 1rem; }
                .btn-close { background: transparent; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-3); }
                .btn-close:hover { color: var(--rose); }
                .btn-tag { transition: all 0.2s ease; cursor: pointer; }
                .btn-tag:hover { border-color: var(--accent); }
                .btn-xs { height: 24px; padding: 0 4px; font-size: 0.7rem; }
                .btn-read { transition: transform 0.1s; }
                .btn-read:active { transform: scale(0.95); }
            `}</style>

            <div style={{ textAlign: 'center', marginTop: '2rem', padding: '2rem', fontSize: '0.65rem', color: 'var(--text-3)', opacity: 0.5 }}>
                v1.00029
            </div>
        </div>
    );
}
