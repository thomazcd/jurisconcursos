'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { signOut } from 'next-auth/react';
import { APP_VERSION } from '@/lib/version';

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
    notes?: string | null;
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
    const [readMap, setReadMap] = useState<Record<string, { count: number, events: string[], correct: number, wrong: number, last: string | null, isFavorite: boolean, notes: string | null }>>({});
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
    const [compactMode, setCompactMode] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [helpStep, setHelpStep] = useState(0);

    const [selectedPrecedent, setSelectedPrecedent] = useState<Precedent | null>(null);
    const [historyModal, setHistoryModal] = useState<{ id: string, events: string[] } | null>(null);
    const [notesModal, setNotesModal] = useState<{ id: string, notes: string | null } | null>(null);
    const [showHints, setShowHints] = useState<Record<string, boolean>>({});

    const loadSubjects = useCallback(() => {
        fetch('/api/user/subjects')
            .then(r => r.json())
            .then(d => setSubjects(d.subjects ?? []));
    }, []);

    useEffect(() => { loadSubjects(); }, [loadSubjects]);

    useEffect(() => {
        if (isFocusMode) {
            document.body.classList.add('is-focus-mode');
        } else {
            document.body.classList.remove('is-focus-mode');
        }
        return () => document.body.classList.remove('is-focus-mode');
    }, [isFocusMode]);

    const loadPrecedents = useCallback(async (subjectId: string, query?: string) => {
        setLoading(true);
        setRevealed({});
        setFlashcardResults({});
        setShowHints({}); // Reset hints when loading new precedents

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
                isFavorite: p.isFavorite ?? false,
                notes: p.notes ?? null,
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

    async function saveNote(id: string, notes: string) {
        setReadMap(m => ({ ...m, [id]: { ...m[id], notes } }));
        await fetch('/api/user/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ precedentId: id, action: 'save_note', notes }),
        });
    }

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
        setShowHints(prev => ({ ...prev, [p.id]: false })); // Hide hint after answering

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

    async function resetAllReads() {
        if (!confirm('Deseja marcar TODOS os julgados como não lidos? Isso zerará o contador de leituras de todo o sistema.')) return;
        setLoading(true);
        try {
            await fetch('/api/user/read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'bulk_reset_reads', precedentId: 'ALL' }),
            });
            await loadPrecedents(selectedSubject, search);
            loadSubjects();
            setShowHelp(false);
            setHelpStep(0);
        } catch (err) {
            console.error(err);
            alert('Erro ao resetar leituras');
        } finally {
            setLoading(false);
        }
    }

    async function resetAllStats() {
        if (!confirm('Deseja zerar TODAS as estatísticas de desempenho (V/F)?')) return;
        setLoading(true);
        try {
            await fetch('/api/user/read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'bulk_reset_stats', precedentId: 'ALL' }),
            });
            await loadPrecedents(selectedSubject, search);
            loadSubjects();
            setShowHelp(false);
            setHelpStep(0);
        } catch (err) {
            console.error(err);
            alert('Erro ao resetar estatísticas');
        } finally {
            setLoading(false);
        }
    }

    async function resetRead(id: string, e: React.MouseEvent) {
        e.stopPropagation();
        if (!confirm('Deseja zerar o progresso deste precedente?')) return;
        await fetch('/api/user/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ precedentId: id, action: 'reset' }),
        });
        setReadMap(m => ({ ...m, [id]: { count: 0, events: [], correct: 0, wrong: 0, last: null, isFavorite: false, notes: null } }));
        loadSubjects();
    }

    const copyToClipboard = (text: string, id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopying(id);
        setTimeout(() => setCopying(null), 2000);
    };

    const availableInformatories = useMemo(() => {
        if (courtFilter === 'ALL') return [];
        const set = new Set<string>();
        precedents.forEach(p => {
            if (p.court === courtFilter && p.informatoryNumber) {
                set.add(p.informatoryNumber);
            }
        });
        return Array.from(set).sort((a, b) => {
            const na = parseInt(a) || 0;
            const nb = parseInt(b) || 0;
            return nb - na;
        });
    }, [precedents, courtFilter]);

    useEffect(() => {
        setInfFilter('ALL');
    }, [courtFilter]);

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
                className={`prec-item ${isRead ? 'is-read-card' : 'is-unread-card'}`}
                style={{
                    borderLeft: `5px solid ${isRead ? '#22c55e' : '#fecaca'}`,
                    padding: compactMode ? '0.4rem 0.85rem' : '1rem 1.25rem',
                    borderRadius: '0 16px 16px 0',
                    background: isRead ? 'rgba(34, 197, 94, 0.04)' : 'rgba(239, 68, 68, 0.03)',
                    boxShadow: isRead ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    marginBottom: compactMode ? '0.2rem' : '0.75rem',
                    position: 'relative',
                    border: isRead ? '1px solid rgba(34, 197, 94, 0.1)' : '1px solid rgba(239, 68, 68, 0.1)',
                    borderLeftWidth: '5px'
                }}
                onClick={() => {
                    if (!isRead) {
                        markRead(p.id, { stopPropagation: () => { } } as any);
                    }
                }}
                onMouseEnter={e => {
                    if (!isRead) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)';
                    }
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = isRead ? 'none' : '0 1px 3px rgba(0,0,0,0.04)';
                }}
            >

                {!compactMode && (
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                        {p.theme && <span style={{ fontSize: '0.65em', background: 'rgba(201,138,0,0.1)', color: '#a06e00', padding: '2px 10px', borderRadius: 20, fontWeight: 700 }}>📌 {p.theme}</span>}
                        {readData.last === 'HIT' && <span style={{ fontSize: '0.65em', background: '#dcfce7', color: '#166534', padding: '2px 10px', borderRadius: 20, fontWeight: 700 }}>✅ Dominado</span>}
                        {readData.last === 'MISS' && <span style={{ fontSize: '0.65em', background: '#fee2e2', color: '#991b1b', padding: '2px 10px', borderRadius: 20, fontWeight: 700 }}>⚠️ Revisar</span>}
                        {isRead && <span style={{ fontSize: '0.65em', background: 'rgba(34, 197, 94, 0.1)', color: '#166534', padding: '2px 10px', borderRadius: 20, fontWeight: 700 }}>📖 Lido</span>}
                    </div>
                )}

                <div className="prec-title" style={{ fontSize: compactMode ? '0.9em' : '1.05em', fontWeight: 800, color: 'var(--text)', marginBottom: compactMode ? '0.25em' : '0.6em', lineHeight: '1.4' }}>{p.title}</div>

                {!isRevealed && studyMode === 'FLASHCARD' ? (
                    <div style={{ background: 'var(--surface2)', padding: '1.25rem', borderRadius: 14, border: '1px solid var(--border)', marginBottom: '0.75rem' }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '1.05em', color: 'var(--text)', fontWeight: 600, marginBottom: '1rem', lineHeight: '1.5' }}>{p.flashcardQuestion || p.summary}</div>
                        <div style={{ display: 'flex', gap: '0.6rem' }}>
                            <button onClick={(e) => { e.stopPropagation(); handleFlashcard(p, true); }} className="btn btn-sm" style={{ flex: 1, background: '#10b981', color: '#fff', fontWeight: 800, height: '38px', borderRadius: 10 }}>VERDADEIRO</button>
                            <button onClick={(e) => { e.stopPropagation(); handleFlashcard(p, false); }} className="btn btn-sm" style={{ flex: 1, background: '#ef4444', color: '#fff', fontWeight: 800, height: '38px', borderRadius: 10 }}>FALSO</button>
                        </div>
                    </div>
                ) : (
                    <div style={{ marginBottom: compactMode ? '0' : '0.75rem' }}>
                        {flashResult && <div style={{ padding: '0.5em 0.75em', marginBottom: '0.5em', borderRadius: 8, background: flashResult === 'CORRECT' ? '#dcfce7' : '#fee2e2', color: flashResult === 'CORRECT' ? '#166534' : '#991b1b', fontWeight: 900, fontSize: '0.8em', border: `1px solid ${flashResult === 'CORRECT' ? '#bcf0da' : '#fecaca'}` }}>{flashResult === 'CORRECT' ? '🎯 ACERTOU!' : '❌ ERROU!'}</div>}
                        <div style={{ fontSize: compactMode ? '0.83em' : '0.92em', color: 'var(--text-2)', lineHeight: compactMode ? '1.4' : '1.6', opacity: 0.9 }}>{p.summary}</div>
                    </div>
                )}

                {!compactMode && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', fontSize: '0.75rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', color: 'var(--text-3)', alignItems: 'center', fontWeight: 600 }}>
                            {/* ★ Estrela de Favoritos ao lado da corte */}
                            <button
                                onClick={(e) => toggleFavorite(p.id, e)}
                                style={{
                                    border: 'none',
                                    background: 'var(--surface2)',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    color: readData.isFavorite ? '#f59e0b' : 'var(--text-4)',
                                    transition: 'all 0.2s',
                                    padding: '4px',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '26px',
                                    height: '26px'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                    e.currentTarget.style.background = 'var(--border)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'none';
                                    e.currentTarget.style.background = 'var(--surface2)';
                                }}
                                title={readData.isFavorite ? 'Remover Favorito' : 'Adicionar aos Favoritos'}
                            >
                                {readData.isFavorite ? '★' : '☆'}
                            </button>
                            {/* 📝 Botão de Anotações */}
                            <button
                                onClick={(e) => { e.stopPropagation(); setNotesModal({ id: p.id, notes: readData.notes }); }}
                                style={{
                                    border: 'none',
                                    background: 'var(--surface2)',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    color: readData.notes ? 'var(--accent)' : 'var(--text-4)',
                                    transition: 'all 0.2s',
                                    padding: '4px',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '26px',
                                    height: '26px',
                                    position: 'relative'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                    e.currentTarget.style.background = 'var(--border)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'none';
                                    e.currentTarget.style.background = 'var(--surface2)';
                                }}
                                title={readData.notes ? 'Ver/Editar Anotação' : 'Adicionar Anotação'}
                            >
                                📝
                                {readData.notes && <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%', border: '2px solid var(--surface1)' }} />}
                            </button>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent)', background: 'rgba(20, 184, 166, 0.08)', padding: '2px 8px', borderRadius: '6px' }}>🏛️ {p.court} {p.informatoryNumber}{p.informatoryYear ? `/${p.informatoryYear}` : ''}</span>
                            {proc && (
                                <span
                                    onClick={(e) => { e.stopPropagation(); setSelectedPrecedent(p); }}
                                    style={{ cursor: 'pointer', padding: '3px 8px', background: 'var(--surface2)', color: 'var(--accent)', borderRadius: 6, fontWeight: 800, border: '1px solid var(--border)' }}
                                    title="Clique para ver detalhes do julgado"
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                >
                                    🔍 {proc}
                                </span>
                            )}
                            {p.judgmentDate && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📅 Julgado: {new Date(p.judgmentDate).toLocaleDateString('pt-BR')}</span>}
                            <span
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: !p.publicationDate ? 'help' : 'default' }}
                                title={!p.publicationDate ? "Na publicação do informativo não foi informada data de publicação do julgado." : undefined}
                            >
                                📢 Publ: {p.publicationDate ? new Date(p.publicationDate).toLocaleDateString('pt-BR') : '--'}
                            </span>
                            {(readData.correct > 0 || readData.wrong > 0) && <span style={{ color: 'var(--text-3)', opacity: 0.8, background: 'var(--surface2)', padding: '2px 6px', borderRadius: 4 }}>📊 {readData.correct}V | {readData.wrong}F</span>}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }} onClick={e => e.stopPropagation()}>
                            {isRead && (
                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                    <button
                                        onClick={(e) => markRead(p.id, e)}
                                        className="btn-activity btn-activity-inc no-print"
                                        title="Lido mais uma vez"
                                    >+1</button>
                                    <button
                                        onClick={(e) => decrementRead(p.id, e)}
                                        className="btn-activity btn-activity-dec no-print"
                                        title="Diminuir uma leitura"
                                    >-1</button>
                                    <div
                                        style={{ marginLeft: '4px', background: 'var(--surface2)', padding: '4px 10px', borderRadius: 8, fontWeight: 800, color: 'var(--text-2)', cursor: 'pointer' }}
                                        onClick={(e) => { e.stopPropagation(); setHistoryModal({ id: p.id, events: readData.events || [] }); }}
                                        title="Clique para ver o histórico de leituras"
                                    >
                                        {readData.count}×
                                    </div>
                                    <button onClick={(e) => resetRead(p.id, e)} className="no-print" style={{ border: 'none', background: 'transparent', padding: '0 4px', cursor: 'pointer', fontSize: '1rem' }} title="Marcar como Não Lido">♻️</button>
                                </div>
                            )}
                            {!isRead && (
                                <button
                                    className="btn btn-primary btn-sm"
                                    style={{ padding: '6px 16px', fontWeight: 800, borderRadius: 10, fontSize: '0.85rem' }}
                                    onClick={(e) => markRead(p.id, e)}
                                >
                                    Marcar como Lido
                                </button>
                            )}
                        </div>
                        {studyMode === 'FLASHCARD' && !isRevealed && (
                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--surface2)', borderRadius: 12, border: '1px dashed var(--border-strong)', textAlign: 'center' }}>
                                {!showHints[p.id] ? (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowHints(prev => ({ ...prev, [p.id]: true })) }}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}
                                    >
                                        💡 Ver Dica (Recuperar Memória)
                                    </button>
                                ) : (
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-2)', fontStyle: 'italic', animation: 'fadeIn 0.3s' }}>
                                        <span style={{ fontWeight: 800, color: 'var(--accent)', marginRight: 8 }}>Dica:</span>
                                        {p.summary.split('.').slice(0, 1).join('.')}.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`dashboard-container ${isFocusMode ? 'focus-mode-active' : ''}`} style={{ fontSize: `${fontSize}px` }}>
            {/* MODAL DE ANOTAÇÕES */}
            {notesModal && (
                <div className="modal-overlay" onClick={() => setNotesModal(null)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="modal-content-animated" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '500px', padding: '1.5rem', borderRadius: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900 }}>📝 Minhas Anotações</h3>
                            <button onClick={() => setNotesModal(null)} style={{ border: 'none', background: 'var(--surface2)', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontWeight: 900 }}>✕</button>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: '1rem', lineHeight: '1.4' }}>
                            Escreva mnemônicos, observações ou pontos importantes para revisar depois.
                        </p>

                        <textarea
                            autoFocus
                            value={notesModal.notes || ''}
                            onChange={(e) => setNotesModal({ ...notesModal, notes: e.target.value })}
                            placeholder="Digite sua nota aqui..."
                            style={{
                                width: '100%',
                                height: '200px',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '2px solid var(--border)',
                                background: 'var(--surface2)',
                                color: 'var(--text)',
                                fontSize: '0.95rem',
                                lineHeight: '1.6',
                                resize: 'none',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        />

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <button
                                onClick={() => {
                                    saveNote(notesModal.id, notesModal.notes || '');
                                    setNotesModal(null);
                                }}
                                className="btn btn-primary"
                                style={{ flex: 1, height: '45px', borderRadius: '12px', fontWeight: 800 }}
                            >
                                Salvar Nota
                            </button>
                            <button
                                onClick={() => setNotesModal(null)}
                                className="btn btn-ghost"
                                style={{ flex: 1, height: '45px', borderRadius: '12px', fontWeight: 700 }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {selectedPrecedent && (
                <div className="modal-overlay" onClick={() => { setSelectedPrecedent(null); setIsFocusMode(false); }}>
                    <div className={`modal-content ${isFocusMode ? 'modal-fullscreen' : ''}`} style={{ maxWidth: '700px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header" style={{ position: 'relative', justifyContent: 'center' }}>
                            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-3)', textAlign: 'center' }}>🔍 Detalhes do Julgado</h2>
                            <button
                                onClick={() => { setSelectedPrecedent(null); setIsFocusMode(false); }}
                                className="btn-close"
                                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }}
                            >✕</button>
                        </div>

                        <div className="modal-body" style={{ fontSize: isFocusMode ? `${fontSize + 3}px` : `${fontSize}px`, padding: '1.5rem 2rem' }}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <h3 style={{ fontSize: '1.3em', fontWeight: 900, color: 'var(--text)', lineHeight: '1.4' }}>{selectedPrecedent.title}</h3>
                            </div>

                            <div style={{ marginBottom: '2rem', lineHeight: '1.8', color: 'var(--text-1)' }}>
                                {selectedPrecedent.summary}
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'minmax(150px, 1fr) 1fr',
                                gap: '1rem',
                                padding: '1.25rem',
                                background: 'var(--surface2)',
                                borderRadius: 12,
                                fontSize: '0.85em',
                                color: 'var(--text-2)',
                                border: '1px solid var(--border)'
                            }}>
                                <div><strong style={{ color: 'var(--text-3)' }}>🏛️ Tribunal:</strong> {selectedPrecedent.court}</div>
                                <div><strong style={{ color: 'var(--text-3)' }}>📰 Informativo:</strong> {selectedPrecedent.informatoryNumber}{selectedPrecedent.informatoryYear ? `/${selectedPrecedent.informatoryYear}` : ''}</div>
                                <div><strong style={{ color: 'var(--text-3)' }}>⚖️ Processo:</strong> {[selectedPrecedent.processClass, selectedPrecedent.processNumber].filter(Boolean).join(' ') || '---'}</div>
                                <div><strong style={{ color: 'var(--text-3)' }}>👤 Relator:</strong> {selectedPrecedent.rapporteur || '---'}</div>
                                <div title="Data de Publicação: Data em que o acórdão foi publicado no Diário da Justiça (DJEN/DJe)">
                                    <strong style={{ color: 'var(--text-3)' }}>📅 Publicação:</strong> {selectedPrecedent.publicationDate ? new Date(selectedPrecedent.publicationDate).toLocaleDateString('pt-BR') : 'Não informada a existência de publicação na divulgação do informativo'}
                                </div>
                                <div title="Data de Julgamento: Data da sessão em que o processo foi julgado pelo tribunal">
                                    <strong style={{ color: 'var(--text-3)' }}>⚖️ Julgamento:</strong> {selectedPrecedent.judgmentDate ? new Date(selectedPrecedent.judgmentDate).toLocaleDateString('pt-BR') : '---'}
                                </div>
                                {selectedPrecedent.theme && <div style={{ gridColumn: 'span 2' }}><strong style={{ color: 'var(--text-3)' }}>📌 Tema:</strong> {selectedPrecedent.theme}</div>}
                                {selectedPrecedent.isRG && <div style={{ gridColumn: 'span 2', color: 'var(--accent)', fontWeight: 800 }}>⚖️ Repercussão Geral</div>}
                            </div>
                        </div>

                        <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)', padding: '1.25rem', borderRadius: '0 0 16px 16px', justifyContent: 'center' }}>
                            {selectedPrecedent.fullTextOrLink && (
                                <a href={selectedPrecedent.fullTextOrLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ minWidth: '200px' }}>🔗 Inteiro Teor</a>
                            )}
                            {!selectedPrecedent.fullTextOrLink && <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>Sem link disponível</div>}
                        </div>
                    </div>
                </div>
            )}

            <div className={`page-header no-print ${isFocusMode ? 'hidden-focus' : ''}`} style={{
                marginBottom: '1.25rem',
                padding: '0.6rem 1.25rem',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                display: isFocusMode ? 'none' : 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '2rem'
            }}>
                {/* Grupos de Ações Centralizados */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

                    {/* Modo de Estudo */}
                    <div style={{ display: 'flex', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '3px', gap: '2px' }}>
                        <button
                            onClick={() => setStudyMode('READ')}
                            style={{ padding: '6px 16px', borderRadius: 9, fontSize: '0.78rem', fontWeight: 800, border: 'none', cursor: 'pointer', transition: 'all 0.15s', background: studyMode === 'READ' ? 'var(--accent)' : 'transparent', color: studyMode === 'READ' ? '#fff' : 'var(--text-3)' }}
                        >📖 Leitura</button>
                        <button
                            onClick={() => setStudyMode('FLASHCARD')}
                            style={{ padding: '6px 16px', borderRadius: 9, fontSize: '0.78rem', fontWeight: 800, border: 'none', cursor: 'pointer', transition: 'all 0.15s', background: studyMode === 'FLASHCARD' ? 'var(--accent)' : 'transparent', color: studyMode === 'FLASHCARD' ? '#fff' : 'var(--text-3)' }}
                        >🧠 V/F</button>
                    </div>

                    <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

                    {/* Visualização */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <button
                            onClick={() => setCompactMode(c => !c)}
                            title={compactMode ? 'Modo completo' : 'Modo compacto: só título e tese'}
                            style={{ padding: '6px 14px', borderRadius: 10, fontSize: '0.78rem', fontWeight: 800, border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.15s', background: compactMode ? 'var(--accent)' : 'var(--surface2)', color: compactMode ? '#fff' : 'var(--text-3)', height: '34px' }}
                        >{compactMode ? '⬚ Compacto' : '▤ Compacto'}</button>

                        <div style={{ display: 'flex', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', height: '34px' }}>
                            <button onClick={() => setFontSize(f => Math.max(10, f - 1))} title="Diminuir fonte" style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '0 12px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-3)' }}>A−</button>
                            <div style={{ width: 1, background: 'var(--border)' }} />
                            <button onClick={() => setFontSize(f => Math.min(24, f + 1))} title="Aumentar fonte" style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '0 12px', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-3)' }}>A+</button>
                        </div>
                    </div>

                    <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

                    {/* Utilidades */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <button
                            onClick={() => window.print()}
                            title="Gerar PDF completo da lista filtrada"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', background: 'var(--surface2)', cursor: 'pointer', width: '34px', height: '34px', borderRadius: 10, transition: 'all 0.15s', color: 'var(--text-2)' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface3, var(--border))'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                        </button>

                        <button
                            onClick={() => setShowHelp(true)}
                            title="Tutorial do sistema"
                            style={{ border: '1px solid var(--border)', background: 'var(--surface2)', cursor: 'pointer', padding: '0 16px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 800, transition: 'all 0.15s', color: 'var(--text-2)', height: '34px', whiteSpace: 'nowrap' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface3, var(--border))'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                        >Tutorial</button>
                    </div>

                    <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

                    {/* Ação Principal */}
                    <button
                        onClick={() => setIsFocusMode(!isFocusMode)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            border: '1px solid var(--border)',
                            cursor: 'pointer',
                            padding: '0 16px',
                            borderRadius: 10,
                            fontSize: '0.75rem',
                            fontWeight: 900,
                            transition: 'all 0.2s',
                            background: isFocusMode ? 'rgba(245, 158, 11, 0.12)' : 'rgba(20, 184, 166, 0.12)',
                            color: isFocusMode ? '#f59e0b' : 'var(--accent)',
                            height: '34px',
                            letterSpacing: '0.05em'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.background = isFocusMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(20, 184, 166, 0.2)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = isFocusMode ? 'rgba(245, 158, 11, 0.12)' : 'rgba(20, 184, 166, 0.12)'; }}
                    >{isFocusMode ? '🔓 SAIR FOCO' : '🎯 MODO FOCO'}</button>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', background: 'var(--surface2)', padding: '2px', borderRadius: 8, border: '1px solid var(--border)' }}>
                            {(['ALL', 'STF', 'STJ'] as const).map(c => <button key={c} onClick={() => setCourtFilter(c)} style={{ padding: '6px 14px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 800, border: 'none', background: courtFilter === c ? 'var(--accent)' : 'transparent', color: courtFilter === c ? '#fff' : 'var(--text-3)', cursor: 'pointer', transition: 'all 0.1s' }}>{c === 'ALL' ? 'Todos' : c}</button>)}
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-3)', opacity: 0.8, marginLeft: '0.4rem' }}>
                            {filtered.length} {filtered.length === 1 ? 'julgado encontrado' : 'julgados encontrados'}
                        </span>

                        {courtFilter !== 'ALL' && availableInformatories.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', animation: 'fadeIn 0.2s' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-3)' }}>INF:</span>
                                <select
                                    value={infFilter}
                                    onChange={e => setInfFilter(e.target.value)}
                                    style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '0.75rem', fontWeight: 700 }}
                                >
                                    <option value="ALL">Todos os Nos</option>
                                    {availableInformatories.map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button className={`btn-tag ${filterOnlyFavorites ? 'active' : ''}`} onClick={() => { setFilterOnlyFavorites(!filterOnlyFavorites); setFilterHideRead(false); setFilterOnlyErrors(false); }} style={{ fontSize: '0.7rem', padding: '4px 10px', background: filterOnlyFavorites ? 'var(--accent)' : 'transparent', color: filterOnlyFavorites ? '#fff' : 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 20, fontWeight: 700 }}>★ Favoritos</button>
                        <button className={`btn-tag ${filterHideRead ? 'active' : ''}`} onClick={() => { setFilterHideRead(!filterHideRead); setFilterOnlyFavorites(false); setFilterOnlyErrors(false); }} style={{ fontSize: '0.7rem', padding: '4px 10px', background: filterHideRead ? 'var(--accent)' : 'transparent', color: filterHideRead ? '#fff' : 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 20, fontWeight: 700 }}>📖 Não Lidos</button>
                        <button className={`btn-tag ${filterOnlyErrors ? 'active' : ''}`} onClick={() => { setFilterOnlyErrors(!filterOnlyErrors); setFilterHideRead(false); setFilterOnlyFavorites(false); }} style={{ fontSize: '0.7rem', padding: '4px 10px', background: filterOnlyErrors ? 'var(--rose)' : 'transparent', color: filterOnlyErrors ? '#fff' : 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 20, fontWeight: 700 }}>❌ Erros</button>
                    </div>
                </div>

                <div className="filter-chips" style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
                    <button
                        className={`chip ${filterOnlyFavorites ? 'active' : ''}`}
                        onClick={() => setFilterOnlyFavorites(!filterOnlyFavorites)}
                    >
                        <span>⭐</span> Favoritos
                    </button>
                    <button
                        className={`chip ${filterOnlyErrors ? 'active' : ''}`}
                        onClick={() => setFilterOnlyErrors(!filterOnlyErrors)}
                    >
                        <span>❌</span> Errados
                    </button>
                    <button
                        className={`chip ${filterHideRead ? 'active' : ''}`}
                        onClick={() => setFilterHideRead(!filterHideRead)}
                    >
                        <span>🆕</span> Não Lidos
                    </button>
                    {courtFilter !== 'ALL' && (
                        <select
                            value={infFilter}
                            onChange={e => setInfFilter(e.target.value)}
                            className="chip"
                            style={{ padding: '4px 12px', height: '32px', appearance: 'none', textAlign: 'center' }}
                        >
                            <option value="ALL">📑 Inf. Todos</option>
                            {availableInformatories.map(inf => (
                                <option key={inf} value={inf}>📑 Inf. {inf}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* Barra flutuante do Modo Foco */}
            {isFocusMode && (
                <div style={{
                    position: 'fixed',
                    top: '0.75rem',
                    right: '1rem',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '6px 10px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    opacity: 0.6,
                    transition: 'opacity 0.2s',
                }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
                >
                    <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                        onClick={() => setIsFocusMode(false)}
                        title="Sair do Modo Foco"
                    >🔓 Sair Foco</button>

                    <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 2px' }} />

                    <button
                        className={`btn btn-sm ${compactMode ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                        onClick={() => setCompactMode(c => !c)}
                        title={compactMode ? 'Voltar ao modo completo' : 'Modo compacto: só título e tese'}
                    >{compactMode ? '🗂️ Completo' : '⬛ Compacto'}</button>

                    <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 2px' }} />

                    <button className="btn btn-ghost btn-xs" style={{ fontSize: '0.75rem' }} onClick={() => setFontSize(f => Math.max(10, f - 1))} title="Diminuir fonte">A-</button>
                    <button className="btn btn-ghost btn-xs" style={{ fontSize: '0.75rem' }} onClick={() => setFontSize(f => Math.min(24, f + 1))} title="Aumentar fonte">A+</button>
                </div>
            )}

            <div className={`prec-list ${isFocusMode ? 'focus-list' : ''}`}>

                {loading ? (
                    <div className="main-content">
                        <div className="page-header" style={{ marginBottom: '2rem' }}>
                            <div className="skeleton-box" style={{ width: '300px', height: '2.5rem', borderRadius: '12px' }} />
                        </div>
                        <div className="stats-row" style={{ marginBottom: '2.5rem' }}>
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="skeleton-box" style={{ height: '100px', borderRadius: '20px' }} />
                            ))}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="skeleton-box" style={{ height: '180px', borderRadius: '24px', width: '100%' }} />
                            ))}
                        </div>
                    </div>
                ) : (groupedPrecedents ? groupedPrecedents.map(([subName, list]) => (
                    <div key={subName} style={{ marginBottom: isFocusMode ? '3rem' : '1.5rem' }}>
                        <div className="subject-header">
                            <div className="subject-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                            </div>
                            <h3>{subName}</h3>
                            <div className="line" />
                            <span>{list.length}</span>
                        </div>
                        {list.map(renderPrecedent)}
                    </div>
                )) : filtered.map(renderPrecedent))}
            </div>

            {showHelp && (
                <div className="modal-overlay" style={{ zIndex: 20000 }} onClick={() => { setShowHelp(false); setHelpStep(0); }}>
                    <div className="modal-content-animated" onClick={e => e.stopPropagation()} style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border-strong)',
                        borderRadius: 30,
                        padding: '2.5rem',
                        maxWidth: '550px',
                        width: 'calc(100% - 2rem)',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Close button */}
                        <button onClick={() => setShowHelp(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--surface2)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: '1rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

                        {/* Emoji ícone com fundo colorido */}
                        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #0d9488, #14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.25rem', boxShadow: '0 10px 20px rgba(13,148,136,0.25)' }}>
                            {['👋', '📖', '🔍', '🧠', '✨'][helpStep]}
                        </div>

                        {/* Título */}
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)', marginBottom: '0.75rem' }}>
                            {['Bem-vindo ao Juris!', 'Marque seu progresso', 'Veja os detalhes', 'Modo V/F', 'Filtros Dinâmicos'][helpStep]}
                        </h2>

                        {/* Descrição */}
                        <p style={{ color: 'var(--text-2)', lineHeight: '1.7', fontSize: '0.95rem', marginBottom: '2rem', background: 'var(--bg)', borderRadius: 12, padding: '1rem 1.25rem', border: '1px solid var(--border)' }}>
                            {[
                                'Aqui você estuda a jurisprudência de forma otimizada. Vamos conhecer os comandos rápidos?',
                                'Clique em qualquer card para marcá-lo como "Lido". Use os botões verde (+1) e vermelho (-1) para registrar quantas vezes você revisou aquele tema. Clique no número de vezes lido para saber a data e hora de cada leitura',
                                'O clique no card marca leitura. Para ver o relator, data exata e link do inteiro teor, clique no número do processo (ex: 🔍 RE 1.234).',
                                'Gosta de Flashcards? Mude para o modo V/F no topo. O sistema esconderá a tese e você deverá julgar se a afirmação é verdadeira ou falsa.',
                                'Ao filtrar por STF ou STJ, um novo campo aparecerá para você escolher o número específico do informativo que deseja focar.',
                                'Ações Globais: Aqui você pode gerenciar seus dados de leitura e desempenho.'
                            ][helpStep]}
                        </p>

                        {helpStep === 4 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface2)', borderRadius: 16, border: '1px solid var(--border)' }}>
                                <div style={{ textAlign: 'left', marginBottom: '0.5rem' }}>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.25rem' }}>Configurações de Reset</h4>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Atenção: estas ações não podem ser desfeitas.</p>
                                </div>
                                <button
                                    onClick={resetAllReads}
                                    className="btn btn-secondary"
                                    style={{ color: 'var(--rose)', borderColor: 'rgba(239, 68, 68, 0.2)', fontSize: '0.75rem', fontWeight: 800 }}
                                >♻️ Marcar TUDO como Não Lido</button>
                                <button
                                    onClick={resetAllStats}
                                    className="btn btn-secondary"
                                    style={{ fontSize: '0.75rem', fontWeight: 800 }}
                                >📊 Zerar Estatísticas de V/F</button>
                            </div>
                        )}

                        {/* Pontos de progresso */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
                            {[0, 1, 2, 3, 4].map(i => (
                                <div key={i} onClick={() => setHelpStep(i)} style={{ width: i === helpStep ? 24 : 8, height: 8, borderRadius: 99, background: i === helpStep ? 'var(--accent)' : 'var(--border-strong)', cursor: 'pointer', transition: 'all 0.2s' }} />
                            ))}
                        </div>

                        {/* Botões */}
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            {helpStep > 0 && <button className="btn btn-secondary" onClick={() => setHelpStep(helpStep - 1)}>← Voltar</button>}
                            <button className="btn btn-primary" onClick={() => helpStep < 4 ? setHelpStep(helpStep + 1) : setShowHelp(false)}>
                                {helpStep < 4 ? 'Próximo →' : '✅ Entendi!'}
                            </button>
                        </div>
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
                .subject-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2.25rem; margin-top: 2rem; }
                .subject-icon { 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    width: 40px; 
                    height: 40px; 
                    border-radius: 12px; 
                    background: var(--surface2); 
                    color: var(--accent); 
                    border: 1px solid var(--border);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                }
                .subject-header h3 { 
                    font-size: 1.15rem; 
                    font-weight: 800; 
                    color: var(--text); 
                    letter-spacing: -0.03em; 
                    white-space: nowrap; 
                    margin: 0; 
                }
                .subject-header .line { flex: 1; height: 1.5px; background: linear-gradient(to right, var(--border-strong), transparent); opacity: 0.3; }
                .subject-header span { 
                    font-size: 0.8rem; 
                    font-weight: 700; 
                    color: var(--text-2); 
                    background: var(--surface); 
                    padding: 4px 14px; 
                    border-radius: 50px;
                    border: 1px solid var(--border);
                }
                
                .btn-activity {
                    border: 1px solid var(--border);
                    background: var(--surface2);
                    color: var(--text-3);
                    width: 22px;
                    height: 22px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 900;
                    font-size: 0.6rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    opacity: 0.4;
                }
                .btn-activity:hover {
                    opacity: 1;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 5px rgba(0,0,0,0.08);
                    border-color: var(--border-strong);
                }
                .btn-activity-inc:hover {
                    background: #22c55e;
                    color: white;
                    border-color: #22c55e;
                }
                .btn-activity-dec:hover {
                    background: #ef4444;
                    color: white;
                    border-color: #ef4444;
                }
                
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
                    .prec-item { break-inside: avoid; border: 1px solid #eee !important; margin-bottom: 0.5rem !important; padding: 0.75rem !important; border-radius: 4px !important; } 
                    .prec-title { color: black !important; font-size: 1.1rem !important; margin-bottom: 0.3rem !important; }
                    .prec-list { padding: 0 !important; }
                    .subject-header { margin-bottom: 0.5rem !important; }
                    body { background: white !important; }
                }
            `}</style>
            {historyModal && (
                <div className="modal-overlay" style={{ zIndex: 30000 }} onClick={() => setHistoryModal(null)}>
                    <div className="modal-content-animated" onClick={e => e.stopPropagation()} style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border-strong)',
                        borderRadius: 20,
                        padding: '1.5rem',
                        maxWidth: '320px',
                        width: 'calc(100% - 2rem)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
                        position: 'relative'
                    }}>
                        <button onClick={() => setHistoryModal(null)} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'var(--surface2)', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>📖 Histórico de Leitura</h3>
                        <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                            {historyModal.events.length > 0 ? [...historyModal.events].reverse().map((e, idx) => (
                                <div key={idx} style={{
                                    padding: '8px 12px',
                                    background: 'var(--surface2)',
                                    borderRadius: 10,
                                    fontSize: '0.85rem',
                                    border: '1px solid var(--border)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontWeight: 700, color: 'var(--accent)' }}>#{historyModal.events.length - idx}</span>
                                    <span style={{ color: 'var(--text)' }}>
                                        {new Date(e).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-3)', fontSize: '0.9rem' }}>Nenhum evento registrado.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="no-print" style={{ textAlign: 'center', padding: '3rem 3rem 2rem', opacity: 0.3, fontSize: '0.65rem', lineHeight: 1.8 }}>
                v{APP_VERSION}<br />Desenvolvido por Thomaz C. Drumond
            </div>
        </div>
    );
}
