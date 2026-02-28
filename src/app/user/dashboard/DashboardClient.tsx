'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';

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
    flashcardQuestion?: string | null;
    flashcardAnswer?: boolean;
    correctCount?: number;
    wrongCount?: number;
    lastResult?: 'HIT' | 'MISS' | null;
    isFavorite: boolean;
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
    const [readMap, setReadMap] = useState<Record<string, { count: number, events: string[], correct: number, wrong: number, last: string | null, isFavorite: boolean }>>({});
    const [search, setSearch] = useState('');
    const [studyMode, setStudyMode] = useState<'READ' | 'FLASHCARD'>('READ');
    const [filterHideRead, setFilterHideRead] = useState(false);
    const [filterOnlyErrors, setFilterOnlyErrors] = useState(false);
    const [filterOnlyFavorites, setFilterOnlyFavorites] = useState(false);
    const [courtFilter, setCourtFilter] = useState<'ALL' | 'STF' | 'STJ'>('ALL');
    const [yearFilter, setYearFilter] = useState<string>('ALL');
    const [infFilter, setInfFilter] = useState<string>('ALL');
    const [revealed, setRevealed] = useState<Record<string, boolean>>({});
    const [copying, setCopying] = useState<string | null>(null);
    const [flashcardResults, setFlashcardResults] = useState<Record<string, 'CORRECT' | 'WRONG' | null>>({});

    // User Preferences
    const [fontSize, setFontSize] = useState(14);
    const [isFocusMode, setIsFocusMode] = useState(false);

    const [selectedPrecedent, setSelectedPrecedent] = useState<Precedent | null>(null);

    const loadSubjects = useCallback(() => {
        fetch('/api/user/subjects')
            .then(r => r.json())
            .then(d => setSubjects(d.subjects ?? []));
    }, []);

    useEffect(() => { loadSubjects(); }, [loadSubjects]);

    const loadPrecedents = useCallback(async (subjectId: string, query?: string) => {
        setLoading(true);
        setRevealed({});
        setFlashcardResults({});

        let url = subjectId === 'ALL' ? '/api/user/precedents' : `/api/user/precedents?subjectId=${subjectId}`;
        if (query) {
            url += (url.includes('?') ? '&' : '?') + `q=${encodeURIComponent(query)}`;
        }

        const r = await fetch(url);
        const d = await r.json();
        const precs: Precedent[] = d.precedents ?? [];
        setPrecedents(precs);
        const map: Record<string, any> = {};
        precs.forEach((p: Precedent) => {
            map[p.id] = {
                count: p.readCount,
                events: p.readEvents,
                correct: p.correctCount ?? 0,
                wrong: p.wrongCount ?? 0,
                last: p.lastResult ?? null,
                isFavorite: p.isFavorite ?? false
            };
        });
        setReadMap(map);
        setLoading(false);
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadPrecedents(selectedSubject, search);
        }, search ? 500 : 0);
        return () => clearTimeout(timeoutId);
    }, [selectedSubject, search, loadPrecedents]);

    async function toggleFavorite(id: string, e: React.MouseEvent) {
        e.stopPropagation();
        const r = await fetch('/api/user/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ precedentId: id, action: 'toggle_favorite' }),
        });
        const d = await r.json();
        setReadMap(m => ({ ...m, [id]: { ...m[id], isFavorite: d.isFavorite } }));
    }

    async function markRead(id: string, e: React.MouseEvent) {
        e.stopPropagation();
        const r = await fetch('/api/user/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ precedentId: id, action: 'increment' }),
        });
        const d = await r.json();
        setReadMap(m => ({ ...m, [id]: { ...m[id], count: d.readCount, events: d.readEvents || [] } }));
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
        setReadMap(m => ({ ...m, [p.id]: { ...m[p.id], count: d.readCount, correct: d.correctCount, wrong: d.wrongCount, last: d.lastResult } }));
        loadSubjects();
    }

    async function decrementRead(id: string, e: React.MouseEvent) {
        e.stopPropagation();
        const r = await fetch('/api/user/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ precedentId: id, action: 'decrement' }),
        });
        const d = await r.json();
        setReadMap(m => ({ ...m, [id]: { ...m[id], count: d.readCount, events: d.readEvents || [] } }));
        loadSubjects();
    }

    async function resetRead(id: string, e: React.MouseEvent) {
        e.stopPropagation();
        if (!confirm('Deseja zerar o progresso deste precedente?')) return;
        await fetch('/api/user/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ precedentId: id, action: 'reset' }),
        });
        setReadMap(m => ({ ...m, [id]: { count: 0, events: [], correct: 0, wrong: 0, last: null, isFavorite: false } }));
        loadSubjects();
    }

    const copyToClipboard = (text: string, id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopying(id);
        setTimeout(() => setCopying(null), 2000);
    };

    const filtered = useMemo(() => {
        return precedents.filter(p => {
            const readData = readMap[p.id] || { count: 0, events: [], correct: 0, wrong: 0, last: null, isFavorite: false };
            if (filterHideRead && readData.count > 0) return false;
            if (filterOnlyErrors && readData.last !== 'MISS') return false;
            if (filterOnlyFavorites && !readData.isFavorite) return false;
            if (courtFilter !== 'ALL' && p.court !== courtFilter) return false;
            if (yearFilter !== 'ALL') {
                const pYear = p.informatoryYear?.toString() || (p.judgmentDate ? new Date(p.judgmentDate).getFullYear().toString() : '');
                if (pYear !== yearFilter) return false;
            }
            if (infFilter !== 'ALL' && p.informatoryNumber !== infFilter) return false;
            return true;
        });
    }, [precedents, filterHideRead, filterOnlyErrors, filterOnlyFavorites, courtFilter, yearFilter, infFilter, readMap]);

    const groupedPrecedents = useMemo(() => {
        if (selectedSubject !== 'ALL' || search.trim() !== '' || yearFilter !== 'ALL' || infFilter !== 'ALL' || courtFilter !== 'ALL') return null;
        const groups: Record<string, Precedent[]> = {};
        filtered.forEach(p => {
            const subName = p.subject?.name || 'Geral';
            if (!groups[subName]) groups[subName] = [];
            groups[subName].push(p);
        });
        return Object.entries(groups).filter(([_, list]) => list.length > 0).sort(([a], [b]) => a.localeCompare(b));
    }, [selectedSubject, filtered, search, yearFilter, infFilter, courtFilter]);

    const renderPrecedent = (p: Precedent) => {
        const readData = readMap[p.id] || { count: 0, events: [], correct: 0, wrong: 0, last: null, isFavorite: false };
        const isRead = readData.count > 0;
        const isRevealed = studyMode === 'READ' || revealed[p.id];
        const proc = [p.processClass, p.processNumber].filter(Boolean).join(' ');
        const flashResult = flashcardResults[p.id];

        return (
            <div
                key={p.id}
                className="prec-item"
                style={{
                    borderLeft: `5px solid ${isRead ? '#22c55e' : '#ef4444'}`,
                    padding: '0.75rem 1.25rem',
                    borderRadius: '0 12px 12px 0',
                    background: 'var(--surface)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    marginBottom: '0.5rem',
                    position: 'relative'
                }}
                onClick={() => setSelectedPrecedent(p)}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
            >
                {/* Estrela de Favoritos no Canto Direito */}
                <div style={{ position: 'absolute', right: '10px', top: '10px', zIndex: 10 }}>
                    <button
                        onClick={(e) => toggleFavorite(p.id, e)}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', color: readData.isFavorite ? 'var(--accent)' : 'var(--border)', transition: 'transform 0.1s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                    >
                        {readData.isFavorite ? '★' : '☆'}
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.4rem', paddingRight: '2rem' }}>
                    {p.theme && <span style={{ fontSize: '0.65em', background: 'rgba(201,138,0,0.1)', color: '#a06e00', padding: '1px 8px', borderRadius: 20, fontWeight: 700 }}>📌 {p.theme}</span>}
                    {readData.last === 'HIT' && <span style={{ fontSize: '0.65em', background: '#dcfce7', color: '#166534', padding: '1px 8px', borderRadius: 20, fontWeight: 700 }}>✅ Dominado</span>}
                    {readData.last === 'MISS' && <span style={{ fontSize: '0.65em', background: '#fee2e2', color: '#991b1b', padding: '1px 8px', borderRadius: 20, fontWeight: 700 }}>⚠️ Revisar</span>}
                </div>

                <div className="prec-title" style={{ fontSize: '1.05em', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem', lineHeight: '1.4', paddingRight: '1rem' }}>{p.title}</div>

                {!isRevealed && studyMode === 'FLASHCARD' ? (
                    <div style={{ background: 'var(--surface2)', padding: '1rem', borderRadius: 12, border: '1px solid var(--border)', marginBottom: '0.5rem' }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '1em', color: 'var(--text)', fontWeight: 600, marginBottom: '0.75rem', lineHeight: '1.5' }}>{p.flashcardQuestion || p.summary}</div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={(e) => { e.stopPropagation(); handleFlashcard(p, true); }} className="btn btn-sm" style={{ flex: 1, background: '#dcfce7', color: '#166534', fontWeight: 800, height: '36px' }}>VERDADEIRO</button>
                            <button onClick={(e) => { e.stopPropagation(); handleFlashcard(p, false); }} className="btn btn-sm" style={{ flex: 1, background: '#fee2e2', color: '#991b1b', fontWeight: 800, height: '36px' }}>FALSO</button>
                        </div>
                    </div>
                ) : (
                    <div style={{ marginBottom: '0.6rem' }}>
                        {flashResult && <div style={{ padding: '0.4rem 0.75rem', marginBottom: '0.4rem', borderRadius: 6, background: flashResult === 'CORRECT' ? '#dcfce7' : '#fee2e2', color: flashResult === 'CORRECT' ? '#166534' : '#991b1b', fontWeight: 900, fontSize: '0.8em' }}>{flashResult === 'CORRECT' ? '🎯 ACERTOU!' : '❌ ERROU!'}</div>}
                        <div style={{ fontSize: '0.9em', color: 'var(--text-2)', lineHeight: '1.5', opacity: 0.9 }}>{p.summary}</div>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.6rem', fontSize: '0.72em' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', color: 'var(--text-3)', alignItems: 'center', fontWeight: 600 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent)' }}>📰 {p.court} {p.informatoryNumber}{p.informatoryYear ? `/${p.informatoryYear}` : ''}</span>
                        <span title="Data de Publicação">📢 {p.publicationDate ? new Date(p.publicationDate).toLocaleDateString('pt-BR') : '---'}</span>
                        <span title="Data de Julgamento">⚖️ {p.judgmentDate ? new Date(p.judgmentDate).toLocaleDateString('pt-BR') : '---'}</span>
                        {proc && <span onClick={(e) => copyToClipboard(proc, p.id, e)} style={{ cursor: 'copy', padding: '2px 6px', background: copying === p.id ? 'var(--accent)' : 'var(--surface2)', color: copying === p.id ? '#fff' : 'inherit', borderRadius: 4 }} title="Copiar número do processo">{copying === p.id ? 'Copiado!' : proc}</span>}
                        {(readData.correct > 0 || readData.wrong > 0) && <span style={{ color: 'var(--text-3)', opacity: 0.7 }}>📊 {readData.correct}V | {readData.wrong}F</span>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', background: isRead ? '#dcfce7' : '#fee2e2', borderRadius: 6, overflow: 'hidden' }}>
                            <span style={{ padding: '2px 8px', color: isRead ? '#166534' : '#991b1b', fontWeight: 800 }}>{isRead ? `${readData.count}×` : 'Não lido'}</span>
                            {isRead && <button onClick={(e) => decrementRead(p.id, e)} style={{ border: 'none', background: 'rgba(0,0,0,0.03)', color: 'inherit', padding: '2px 8px', cursor: 'pointer', fontWeight: 900, borderLeft: '1px solid rgba(0,0,0,0.1)' }}>-1</button>}
                        </div>
                        {studyMode === 'READ' && <button className="btn-read" style={{ padding: '4px 10px', fontWeight: 800, borderRadius: 6, fontSize: '0.88em' }} onClick={(e) => markRead(p.id, e)}>{isRead ? '+1' : 'Ler'}</button>}
                        {isRead && <button onClick={(e) => resetRead(p.id, e)} style={{ border: 'none', background: 'transparent', padding: '0 4px', opacity: 0.3, cursor: 'pointer' }}>🗑️</button>}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`dashboard-container ${isFocusMode ? 'focus-mode-active' : ''}`} style={{ fontSize: `${fontSize}px` }}>
            {selectedPrecedent && (
                <div className="modal-overlay" onClick={() => { setSelectedPrecedent(null); setIsFocusMode(false); }}>
                    <div className={`modal-content ${isFocusMode ? 'modal-fullscreen' : ''}`} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-3)' }}>🔍 Detalhes do Julgado</h2>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => setIsFocusMode(!isFocusMode)} className="btn btn-ghost" title="Modo Foco">{isFocusMode ? '🔲' : '🔳'}</button>
                                <button onClick={() => { setSelectedPrecedent(null); setIsFocusMode(false); }} className="btn-close">✕</button>
                            </div>
                        </div>
                        <div className="modal-body" style={{ fontSize: isFocusMode ? `${fontSize + 4}px` : `${fontSize}px` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', alignItems: 'flex-start' }}>
                                <h3 style={{ fontSize: '1.3em', fontWeight: 900, color: 'var(--text)', flex: 1, paddingRight: '2rem', lineHeight: '1.4' }}>{selectedPrecedent.title}</h3>
                                <button onClick={(e) => toggleFavorite(selectedPrecedent.id, e)} style={{ border: 'none', background: 'transparent', fontSize: '2.5rem', cursor: 'pointer', color: readMap[selectedPrecedent.id]?.isFavorite ? 'var(--accent)' : 'var(--border)', transition: 'all 0.2s', marginTop: '-10px' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                    {readMap[selectedPrecedent.id]?.isFavorite ? '★' : '☆'}
                                </button>
                            </div>
                            <div style={{ padding: '1.5rem', background: 'var(--surface2)', borderRadius: 20, marginBottom: '2rem', lineHeight: '1.8', color: 'var(--text-1)', border: '1px solid var(--border)' }}>
                                {selectedPrecedent.summary}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                                <div className="detail-item"><span className="detail-label">Tribunal</span><span className="detail-val">{selectedPrecedent.court}</span></div>
                                <div className="detail-item"><span className="detail-label">Processo</span><span className="detail-val" onClick={(e) => copyToClipboard([selectedPrecedent.processClass, selectedPrecedent.processNumber].filter(Boolean).join(' '), 'modal', e)} style={{ cursor: 'copy' }}>{[selectedPrecedent.processClass, selectedPrecedent.processNumber].filter(Boolean).join(' ') || '---'} {copying === 'modal' && '✓'}</span></div>
                                <div className="detail-item"><span className="detail-label">Órgão</span><span className="detail-val">{selectedPrecedent.organ || '---'}</span></div>
                                <div className="detail-item"><span className="detail-label">Informativo</span><span className="detail-val">{selectedPrecedent.informatoryNumber}{selectedPrecedent.informatoryYear ? `/${selectedPrecedent.informatoryYear}` : ''}</span></div>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ justifyContent: 'center', gap: '1rem' }}>
                            <button onClick={() => window.print()} className="btn btn-secondary">🖨️ PDF para Revisão</button>
                            {selectedPrecedent.fullTextOrLink && (
                                <a href={selectedPrecedent.fullTextOrLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary">🔗 Inteiro Teor</a>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className={`page-header no-print ${isFocusMode ? 'hidden-focus' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => setIsFocusMode(!isFocusMode)} className="btn btn-secondary btn-sm" title="Alternar Modo Foco">
                        {isFocusMode ? '🔓 Sair Modo Foco' : '🎯 Modo Foco'}
                    </button>
                    <div><h1 style={{ fontSize: '1.1rem', fontWeight: 900 }}>{TRACK_LABELS[track] ?? track}</h1><div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Olá, {userName}</div></div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => window.print()} title="Gerar PDF completo da lista filtrada">🖨️ PDF Completo</button>
                    <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: 10, padding: '2px', margin: '0 0.5rem' }}>
                        <button className="btn btn-ghost btn-xs" onClick={() => setFontSize(f => Math.max(10, f - 1))}>A-</button>
                        <button className="btn btn-ghost btn-xs" onClick={() => setFontSize(f => Math.min(24, f + 1))}>A+</button>
                    </div>
                    <button className={`btn btn-sm ${studyMode === 'READ' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStudyMode('READ')}>📖 Leitura</button>
                    <button className={`btn btn-sm ${studyMode === 'FLASHCARD' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStudyMode('FLASHCARD')}>🧠 V/F</button>
                </div>
            </div>

            <div className={`no-print ${isFocusMode ? 'hidden-focus' : ''}`} style={{ background: 'var(--surface)', padding: '1rem', borderRadius: 16, marginBottom: '1rem', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} style={{ flex: '0 0 220px', padding: '0.5rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', fontWeight: 600, fontSize: '0.85rem' }}>
                        <option value="ALL">📚 Todas as Matérias</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <input type="search" placeholder="🔍 Buscar em tudo..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '0.85rem' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', background: 'var(--surface2)', padding: '2px', borderRadius: 8 }}>
                            {(['ALL', 'STF', 'STJ'] as const).map(c => <button key={c} onClick={() => setCourtFilter(c)} style={{ padding: '4px 12px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 800, border: 'none', background: courtFilter === c ? 'var(--accent)' : 'transparent', color: courtFilter === c ? '#fff' : 'var(--text-3)', cursor: 'pointer' }}>{c === 'ALL' ? 'Todos' : c}</button>)}
                        </div>
                        <button className={`btn-tag ${filterOnlyFavorites ? 'active' : ''}`} onClick={() => { setFilterOnlyFavorites(!filterOnlyFavorites); setFilterHideRead(false); setFilterOnlyErrors(false); }} style={{ fontSize: '0.7rem', padding: '4px 10px', background: filterOnlyFavorites ? 'var(--accent)' : 'transparent', color: filterOnlyFavorites ? '#fff' : 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 20, fontWeight: 700 }}>★ Favoritos</button>
                        <button className={`btn-tag ${filterOnlyErrors ? 'active' : ''}`} onClick={() => { setFilterOnlyErrors(!filterOnlyErrors); setFilterHideRead(false); setFilterOnlyFavorites(false); }} style={{ fontSize: '0.7rem', padding: '4px 10px', background: filterOnlyErrors ? 'var(--rose)' : 'transparent', color: filterOnlyErrors ? '#fff' : 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 20, fontWeight: 700 }}>❌ Erros</button>
                    </div>
                </div>
            </div>

            <div className={`prec-list ${isFocusMode ? 'focus-list' : ''}`}>
                {loading ? <div style={{ padding: '5rem', textAlign: 'center', opacity: 0.5 }}>Carregando julgados...</div> :
                    (groupedPrecedents ? groupedPrecedents.map(([subName, list]) => (
                        <div key={subName} style={{ marginBottom: isFocusMode ? '3rem' : '1.5rem' }}>
                            <div className="subject-header"><h3>📚 {subName}</h3><div className="line" /><span>{list.length}</span></div>
                            {list.map(renderPrecedent)}
                        </div>
                    )) : filtered.map(renderPrecedent))}
            </div>

            {isFocusMode && (
                <div className="focus-exit no-print">
                    <button onClick={() => setIsFocusMode(false)} className="btn btn-primary btn-sm">🎯 Sair do Modo Foco</button>
                    <div style={{ color: 'var(--text-3)', fontSize: '0.8rem', fontWeight: 600 }}>Ambiente de Leitura Ativo</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-ghost btn-xs" onClick={() => setFontSize(f => Math.max(10, f - 1))}>A-</button>
                        <button className="btn btn-ghost btn-xs" onClick={() => setFontSize(f => Math.min(24, f + 1))}>A+</button>
                    </div>
                </div>
            )}

            <style jsx>{`
                .hidden-focus { display: none !important; }
                .focus-exit {
                    position: fixed;
                    top: 1.5rem;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 10000;
                    background: var(--surface);
                    padding: 0.5rem 1.5rem;
                    border-radius: 50px;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                    border: 1px solid var(--border);
                }
                .subject-header { display: flex; alignItems: center; gap: 0.75rem; margin-bottom: 1rem; }
                .subject-header h3 { font-size: 0.75rem; font-weight: 900; color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em; white-space: nowrap; }
                .subject-header .line { flex: 1; height: 1px; background: var(--border); }
                .subject-header span { font-size: 0.65rem; font-weight: 800; color: var(--text-3); background: var(--surface2); padding: 1px 6px; border-radius: 4px; }
                
                .focus-mode-active { 
                    position: fixed; 
                    inset: 0; 
                    z-index: 9999; 
                    background: var(--background); 
                    padding: 0; 
                    overflow-y: auto; 
                    animation: fadeIn 0.3s ease-out;
                }
                
                .focus-list {
                    max-width: 850px;
                    margin: 0 auto;
                    padding: 4rem 2rem;
                }

                .modal-fullscreen { 
                    max-width: 100% !important; 
                    height: 100vh !important; 
                    border-radius: 0 !important; 
                    display: flex;
                    flex-direction: column;
                }
                
                .modal-fullscreen .modal-body {
                    max-width: 900px;
                    margin: 0 auto;
                    width: 100%;
                    padding: 4rem 2rem;
                    flex: 1;
                    overflow-y: auto;
                }

                .modal-fullscreen .modal-header {
                    padding: 1rem 2rem;
                    background: var(--surface);
                    border-bottom: 1px solid var(--border);
                }
                .detail-label { display: block; fontSize: 0.7rem; color: var(--text-3); fontWeight: 700; textTransform: uppercase; marginBottom: 0.2rem; }
                .detail-val { fontWeight: 800; color: var(--text); font-size: 0.95rem; }
                
                @media print { 
                    .no-print { display: none !important; } 
                    .dashboard-container { padding: 0 !important; width: 100% !important; background: white !important; } 
                    .focus-mode-active { position: static !important; padding: 0 !important; background: transparent !important; }
                    .prec-item { break-inside: avoid; border: 1px solid #ccc !important; margin-bottom: 1.5rem !important; padding: 1.5rem !important; border-radius: 8px !important; } 
                    .prec-title { color: black !important; font-size: 1.2rem !important; }
                    .prec-list { padding: 0 !important; }
                    body { background: white !important; }
                }
            `}</style>
            <div className="no-print" style={{ textAlign: 'center', padding: '3rem', opacity: 0.3, fontSize: '0.65rem' }}>v1.00037</div>
        </div>
    );
}
