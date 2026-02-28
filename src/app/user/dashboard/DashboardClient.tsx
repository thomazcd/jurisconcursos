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
        precs.forEach(p => {
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
        precedents.forEach(p => { if (p.informatoryNumber) infs.add(p.informatoryNumber); });
        return Array.from(infs).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
    }, [precedents]);

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

    async function markRead(id: string) {
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

    async function decrementRead(id: string) {
        const r = await fetch('/api/user/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ precedentId: id, action: 'decrement' }),
        });
        const d = await r.json();
        setReadMap(m => ({ ...m, [id]: { ...m[id], count: d.readCount, events: d.readEvents || [] } }));
        loadSubjects();
    }

    async function resetRead(id: string) {
        if (!confirm('Deseja zerar o progresso deste precedente?')) return;
        await fetch('/api/user/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ precedentId: id, action: 'reset' }),
        });
        setReadMap(m => ({ ...m, [id]: { count: 0, events: [], correct: 0, wrong: 0, last: null, isFavorite: false } }));
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
                style={{ borderLeft: `4px solid ${isRead ? '#22c55e' : '#ef4444'}`, padding: '1rem', borderRadius: '0 12px 12px 0', background: 'var(--surface)', boxShadow: '0 2px 4px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', marginBottom: '0.8rem', position: 'relative' }}
                onClick={() => setSelectedPrecedent(p)}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.04)'; }}
            >
                <div style={{ position: 'absolute', right: '12px', top: '12px', zIndex: 10 }}>
                    <button onClick={(e) => toggleFavorite(p.id, e)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', color: readData.isFavorite ? 'var(--accent)' : 'var(--border)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                        {readData.isFavorite ? '★' : '☆'}
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.6rem', paddingRight: '2rem' }}>
                    {p.theme && <span style={{ fontSize: '0.7em', background: 'rgba(201,138,0,0.1)', color: '#a06e00', padding: '1px 10px', borderRadius: 20, fontWeight: 700 }}>📌 {p.theme}</span>}
                    {readData.last === 'HIT' && <span style={{ fontSize: '0.7em', background: '#dcfce7', color: '#166534', padding: '1px 10px', borderRadius: 20, fontWeight: 700 }}>✅ Dominado</span>}
                    {readData.last === 'MISS' && <span style={{ fontSize: '0.7em', background: '#fee2e2', color: '#991b1b', padding: '1px 10px', borderRadius: 20, fontWeight: 700 }}>⚠️ Revisar</span>}
                </div>

                <div className="prec-title" style={{ fontSize: '1.05em', fontWeight: 800, color: 'var(--text)', marginBottom: '0.75rem', lineHeight: '1.4' }}>{p.title}</div>

                {!isRevealed && studyMode === 'FLASHCARD' ? (
                    <div style={{ background: 'var(--surface2)', padding: '1.25rem', borderRadius: 16, border: '1px solid var(--border)', marginBottom: '0.75rem' }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '1.05em', color: 'var(--text)', fontWeight: 600, marginBottom: '1.25rem', lineHeight: '1.5' }}>{p.flashcardQuestion || p.summary}</div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={(e) => { e.stopPropagation(); handleFlashcard(p, true); }} className="btn btn-sm" style={{ flex: 1, background: '#dcfce7', color: '#166534', fontWeight: 800, height: '40px' }}>VERDADEIRO</button>
                            <button onClick={(e) => { e.stopPropagation(); handleFlashcard(p, false); }} className="btn btn-sm" style={{ flex: 1, background: '#fee2e2', color: '#991b1b', fontWeight: 800, height: '40px' }}>FALSO</button>
                        </div>
                    </div>
                ) : (
                    <div style={{ marginBottom: '0.75rem' }}>
                        {flashResult && <div style={{ padding: '0.5rem 1rem', marginBottom: '0.75rem', borderRadius: 8, background: flashResult === 'CORRECT' ? '#dcfce7' : '#fee2e2', color: flashResult === 'CORRECT' ? '#166534' : '#991b1b', fontWeight: 900, fontSize: '0.85em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{flashResult === 'CORRECT' ? '🎯 ACERTOU!' : '❌ ERROU!'}</div>}
                        <div style={{ fontSize: '0.95em', color: 'var(--text-2)', lineHeight: '1.6' }}>{p.summary}</div>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', fontSize: '0.75em' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-3)', alignItems: 'center', fontWeight: 500 }}>
                        <span title="Data de Publicação">📢 {p.publicationDate ? new Date(p.publicationDate).toLocaleDateString('pt-BR') : '---'}</span>
                        <span title="Data de Julgamento">⚖️ {p.judgmentDate ? new Date(p.judgmentDate).toLocaleDateString('pt-BR') : '---'}</span>
                        {proc && <span onClick={() => copyToClipboard(proc, p.id)} style={{ cursor: 'copy', padding: '2px 8px', background: copying === p.id ? 'var(--accent)' : 'var(--surface2)', color: copying === p.id ? '#fff' : 'inherit', borderRadius: 4 }} title="Copiar processo">{copying === p.id ? 'Copiado!' : proc}</span>}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>📰 {p.court} {p.informatoryNumber}{p.informatoryYear ? `/${p.informatoryYear}` : ''}</span>
                        {(readData.correct > 0 || readData.wrong > 0) && <span style={{ color: 'var(--text-3)', background: 'var(--surface2)', padding: '2px 8px', borderRadius: 4 }}>📊 {readData.correct}V | {readData.wrong}F</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: isRead ? '#dcfce7' : '#fee2e2', borderRadius: 6, overflow: 'hidden' }}>
                            <span style={{ padding: '2px 10px', color: isRead ? '#166534' : '#991b1b', fontWeight: 800 }}>{isRead ? `✓ ${readData.count}×` : 'Não lido'}</span>
                            {isRead && <button onClick={() => decrementRead(p.id)} style={{ border: 'none', background: 'rgba(0,0,0,0.05)', color: 'inherit', padding: '2px 8px', cursor: 'pointer', fontWeight: 800, borderLeft: '1px solid rgba(0,0,0,0.1)' }}>-1</button>}
                        </div>
                        {studyMode === 'READ' && <button className="btn-read" style={{ padding: '4px 12px', fontWeight: 700, borderRadius: 6 }} onClick={() => markRead(p.id)}>{isRead ? '+1' : 'Ler'}</button>}
                        {isRead && <button onClick={() => resetRead(p.id)} style={{ border: 'none', background: 'transparent', padding: '0 6px', opacity: 0.5, cursor: 'pointer' }}>🗑️</button>}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`dashboard-container ${isFocusMode ? 'focus-mode' : ''}`} style={{ fontSize: `${fontSize}px` }}>
            {selectedPrecedent && (
                <div className="modal-overlay" onClick={() => { setSelectedPrecedent(null); setIsFocusMode(false); }}>
                    <div className={`modal-content ${isFocusMode ? 'modal-fullscreen' : ''}`} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 900 }}>🔍 Detalhes do Julgado</h2>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => setIsFocusMode(!isFocusMode)} className="btn btn-ghost" title="Modo Foco">{isFocusMode ? '🔲' : '🔳'}</button>
                                <button onClick={() => { setSelectedPrecedent(null); setIsFocusMode(false); }} className="btn-close">✕</button>
                            </div>
                        </div>
                        <div className="modal-body" style={{ fontSize: isFocusMode ? `${fontSize + 4}px` : `${fontSize}px` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.3em', fontWeight: 900, color: 'var(--text)', flex: 1 }}>{selectedPrecedent.title}</h3>
                                <button onClick={(e) => toggleFavorite(selectedPrecedent.id, e)} style={{ border: 'none', background: 'transparent', fontSize: '1.8rem', cursor: 'pointer', color: readMap[selectedPrecedent.id]?.isFavorite ? 'var(--accent)' : 'var(--border)' }}>
                                    {readMap[selectedPrecedent.id]?.isFavorite ? '★' : '☆'}
                                </button>
                            </div>
                            <div style={{ padding: '1.5rem', background: 'var(--surface2)', borderRadius: 20, marginBottom: '2rem', lineHeight: '1.8', color: 'var(--text-1)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                                {selectedPrecedent.summary}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                <div className="detail-item"><span className="detail-label">Tribunal</span><span className="detail-val">{selectedPrecedent.court}</span></div>
                                <div className="detail-item"><span className="detail-label">Processo</span><span className="detail-val" onClick={() => copyToClipboard([selectedPrecedent.processClass, selectedPrecedent.processNumber].filter(Boolean).join(' '), 'modal')} style={{ cursor: 'copy' }}>{[selectedPrecedent.processClass, selectedPrecedent.processNumber].filter(Boolean).join(' ') || '---'} {copying === 'modal' && '✓'}</span></div>
                                <div className="detail-item"><span className="detail-label">Órgão</span><span className="detail-val">{selectedPrecedent.organ || '---'}</span></div>
                                <div className="detail-item"><span className="detail-label">Informativo</span><span className="detail-val">{selectedPrecedent.informatoryNumber}{selectedPrecedent.informatoryYear ? `/${selectedPrecedent.informatoryYear}` : ''}</span></div>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ justifyContent: 'center' }}>
                            <button onClick={() => window.print()} className="btn btn-secondary">🖨️ Gerar PDF da Tese</button>
                            {selectedPrecedent.fullTextOrLink && (
                                <a href={selectedPrecedent.fullTextOrLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary">🔗 Ver Inteiro Teor</a>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="page-header no-print">
                <div><h1 style={{ fontSize: '1.2rem', fontWeight: 900 }}>{TRACK_LABELS[track] ?? track}</h1><div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Olá, {userName} • {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</div></div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => window.print()} title="Imprimir este resumo semanal">🖨️ PDF Semanal</button>
                    <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: 10, padding: 4, margin: '0 0.5rem' }}>
                        <button className="btn btn-ghost btn-xs" onClick={() => setFontSize(f => Math.max(10, f - 2))}>A-</button>
                        <button className="btn btn-ghost btn-xs" onClick={() => setFontSize(f => Math.min(24, f + 2))}>A+</button>
                    </div>
                    <button className={`btn btn-sm ${studyMode === 'READ' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStudyMode('READ')}>📖 Leitura</button>
                    <button className={`btn btn-sm ${studyMode === 'FLASHCARD' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStudyMode('FLASHCARD')}>🧠 Simulado V/F</button>
                </div>
            </div>

            <div className="no-print" style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: 20, marginBottom: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                    <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} style={{ flex: '0 0 240px', padding: '0.6rem', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', fontWeight: 600 }}>
                        <option value="ALL">📚 Buscar em Todas as Matérias</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <input type="search" placeholder="🔍 Buscar termo em todos os julgados..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '0.9rem' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', background: 'var(--surface2)', padding: '2px', borderRadius: 10 }}>
                            {(['ALL', 'STF', 'STJ'] as const).map(c => <button key={c} onClick={() => setCourtFilter(c)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 800, border: 'none', background: courtFilter === c ? 'var(--accent)' : 'transparent', color: courtFilter === c ? '#fff' : 'var(--text-3)', cursor: 'pointer' }}>{c === 'ALL' ? 'Tudo' : c}</button>)}
                        </div>
                        <button className={`btn-tag ${filterOnlyFavorites ? 'active' : ''}`} onClick={() => { setFilterOnlyFavorites(!filterOnlyFavorites); setFilterHideRead(false); setFilterOnlyErrors(false); }} style={{ fontSize: '0.75rem', padding: '6px 12px', background: filterOnlyFavorites ? 'var(--accent)' : 'transparent', color: filterOnlyFavorites ? '#fff' : 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 20, fontWeight: 700 }}>★ Favoritos</button>
                        <button className={`btn-tag ${filterOnlyErrors ? 'active' : ''}`} onClick={() => { setFilterOnlyErrors(!filterOnlyErrors); setFilterHideRead(false); setFilterOnlyFavorites(false); }} style={{ fontSize: '0.75rem', padding: '6px 12px', background: filterOnlyErrors ? 'var(--rose)' : 'transparent', color: filterOnlyErrors ? '#fff' : 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 20, fontWeight: 700 }}>❌ Ver Erros</button>
                    </div>
                </div>
            </div>

            <div className="prec-list">
                {loading ? <div style={{ padding: '5rem', textAlign: 'center', opacity: 0.5 }}>Carregando julgados...</div> :
                    (groupedPrecedents ? groupedPrecedents.map(([subName, list]) => (
                        <div key={subName} style={{ marginBottom: '2.5rem' }}>
                            <div className="subject-header"><h3>📚 {subName}</h3><div className="line" /><span>{list.length}</span></div>
                            {list.map(renderPrecedent)}
                        </div>
                    )) : filtered.map(renderPrecedent))}
            </div>

            <style jsx>{`
                .subject-header { display: flex; alignItems: center; gap: 1rem; margin-bottom: 1.5rem; }
                .subject-header h3 { font-size: 0.85rem; font-weight: 900; color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em; white-space: nowrap; }
                .subject-header .line { flex: 1; height: 1px; background: var(--border); }
                .subject-header span { font-size: 0.7rem; font-weight: 800; color: var(--text-3); background: var(--surface2); padding: 2px 8px; border-radius: 6px; }
                .focus-mode { padding: 0 !important; background: var(--surface) !important; }
                .modal-fullscreen { max-width: 100% !important; height: 100vh !important; border-radius: 0 !important; }
                .detail-label { display: block; fontSize: 0.75rem; color: var(--text-3); fontWeight: 700; textTransform: uppercase; marginBottom: 0.25rem; }
                .detail-val { fontWeight: 800; color: var(--text); }
                @media print { .no-print { display: none !important; } .dashboard-container { padding: 0 !important; width: 100% !important; } .prec-item { break-inside: avoid; border: 1px solid #eee !important; margin-bottom: 2rem !important; } }
            `}</style>
            <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.3, fontSize: '0.7rem' }}>v1.00032</div>
        </div>
    );
}
