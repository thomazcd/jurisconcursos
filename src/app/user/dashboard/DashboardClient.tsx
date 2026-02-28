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
    const [compactMode, setCompactMode] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [helpStep, setHelpStep] = useState(0);

    const [selectedPrecedent, setSelectedPrecedent] = useState<Precedent | null>(null);

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

                <div className="prec-title" style={{ fontSize: compactMode ? '0.9rem' : '1.05rem', fontWeight: 800, color: 'var(--text)', marginBottom: compactMode ? '0.25rem' : '0.6rem', lineHeight: '1.4' }}>{p.title}</div>

                {!isRevealed && studyMode === 'FLASHCARD' ? (
                    <div style={{ background: 'var(--surface2)', padding: '1.25rem', borderRadius: 14, border: '1px solid var(--border)', marginBottom: '0.75rem' }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '1rem', color: 'var(--text)', fontWeight: 600, marginBottom: '1rem', lineHeight: '1.5' }}>{p.flashcardQuestion || p.summary}</div>
                        <div style={{ display: 'flex', gap: '0.6rem' }}>
                            <button onClick={(e) => { e.stopPropagation(); handleFlashcard(p, true); }} className="btn btn-sm" style={{ flex: 1, background: '#10b981', color: '#fff', fontWeight: 800, height: '38px', borderRadius: 10 }}>VERDADEIRO</button>
                            <button onClick={(e) => { e.stopPropagation(); handleFlashcard(p, false); }} className="btn btn-sm" style={{ flex: 1, background: '#ef4444', color: '#fff', fontWeight: 800, height: '38px', borderRadius: 10 }}>FALSO</button>
                        </div>
                    </div>
                ) : (
                    <div style={{ marginBottom: compactMode ? '0' : '0.75rem' }}>
                        {flashResult && <div style={{ padding: '0.5rem 0.75rem', marginBottom: '0.5rem', borderRadius: 8, background: flashResult === 'CORRECT' ? '#dcfce7' : '#fee2e2', color: flashResult === 'CORRECT' ? '#166534' : '#991b1b', fontWeight: 900, fontSize: '0.8rem', border: `1px solid ${flashResult === 'CORRECT' ? '#bcf0da' : '#fecaca'}` }}>{flashResult === 'CORRECT' ? '🎯 ACERTOU!' : '❌ ERROU!'}</div>}
                        <div style={{ fontSize: compactMode ? '0.83rem' : '0.92rem', color: 'var(--text-2)', lineHeight: compactMode ? '1.4' : '1.6', opacity: 0.9 }}>{p.summary}</div>
                    </div>
                )}

                {!compactMode && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', fontSize: '0.75rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-3)', alignItems: 'center', fontWeight: 600 }}>
                            {/* ★ Estrela de Favoritos na linha de meta */}
                            <button
                                onClick={(e) => toggleFavorite(p.id, e)}
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.1rem', color: readData.isFavorite ? '#f59e0b' : 'var(--border)', transition: 'transform 0.1s', padding: 0 }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                                title={readData.isFavorite ? 'Remover Favorito' : 'Adicionar aos Favoritos'}
                            >
                                {readData.isFavorite ? '★' : '☆'}
                            </button>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent)' }}>🏛️ {p.court} {p.informatoryNumber}{p.informatoryYear ? `/${p.informatoryYear}` : ''}</span>
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
                                        className="btn-action-hit no-print"
                                        style={{ border: 'none', background: '#22c55e', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontWeight: 900, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(34,197,94,0.2)' }}
                                        title="Lido mais uma vez"
                                    >+1</button>
                                    <button
                                        onClick={(e) => decrementRead(p.id, e)}
                                        className="btn-action-miss no-print"
                                        style={{ border: 'none', background: '#ef4444', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontWeight: 900, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(239,68,68,0.2)' }}
                                        title="Diminuir uma leitura"
                                    >-1</button>
                                    <div
                                        style={{ marginLeft: '4px', background: 'var(--surface2)', padding: '4px 10px', borderRadius: 8, fontWeight: 800, color: 'var(--text-2)', cursor: 'help' }}
                                        title={readData.events && readData.events.length > 0
                                            ? "Histórico de Leituras:\n" + readData.events.map((e: string) => `• ${new Date(e).toLocaleString('pt-BR')}`).join('\n')
                                            : "Nenhum evento registrado"}
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
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`dashboard-container ${isFocusMode ? 'focus-mode-active' : ''}`} style={{ fontSize: `${fontSize}px` }}>
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

            <div className={`page-header no-print ${isFocusMode ? 'hidden-focus' : ''}`} style={{ marginBottom: '1.25rem', padding: '0.75rem 1.25rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>

                {/* LEFT — Logo + Título + Saudação */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, var(--accent) 0%, #0ea5e9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0, boxShadow: '0 2px 8px rgba(20,184,166,0.3)' }}>⚖️</div>
                    <div style={{ minWidth: 0 }}>
                        <h1 style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--text)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{TRACK_LABELS[track] ?? track}</h1>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600, marginTop: 1 }}>👤 {userName}</div>
                    </div>
                </div>

                {/* CENTER — Pill toggles de modo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {/* Modo de estudo */}
                    <div style={{ display: 'flex', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '3px', gap: '2px' }}>
                        <button
                            onClick={() => setStudyMode('READ')}
                            style={{ padding: '5px 14px', borderRadius: 9, fontSize: '0.78rem', fontWeight: 800, border: 'none', cursor: 'pointer', transition: 'all 0.15s', background: studyMode === 'READ' ? 'var(--accent)' : 'transparent', color: studyMode === 'READ' ? '#fff' : 'var(--text-3)' }}
                            title="Modo Leitura"
                        >📖 Leitura</button>
                        <button
                            onClick={() => setStudyMode('FLASHCARD')}
                            style={{ padding: '5px 14px', borderRadius: 9, fontSize: '0.78rem', fontWeight: 800, border: 'none', cursor: 'pointer', transition: 'all 0.15s', background: studyMode === 'FLASHCARD' ? 'var(--accent)' : 'transparent', color: studyMode === 'FLASHCARD' ? '#fff' : 'var(--text-3)' }}
                            title="Modo Flashcard V/F"
                        >🧠 V/F</button>
                    </div>

                    {/* Separador visual */}
                    <div style={{ width: 1, height: 28, background: 'var(--border)', margin: '0 2px' }} />

                    {/* Compacto toggle */}
                    <button
                        onClick={() => setCompactMode(c => !c)}
                        title={compactMode ? 'Modo completo' : 'Modo compacto: só título e tese'}
                        style={{ padding: '5px 14px', borderRadius: 10, fontSize: '0.78rem', fontWeight: 800, border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.15s', background: compactMode ? 'var(--accent)' : 'var(--surface2)', color: compactMode ? '#fff' : 'var(--text-3)' }}
                    >{compactMode ? '⬚ Compacto' : '▤ Compacto'}</button>
                </div>

                {/* RIGHT — Ações secundárias (icon-only com tooltip) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {/* Font size */}
                    <div style={{ display: 'flex', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                        <button onClick={() => setFontSize(f => Math.max(10, f - 1))} title="Diminuir fonte" style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '5px 10px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-3)', lineHeight: 1 }}>A−</button>
                        <div style={{ width: 1, background: 'var(--border)' }} />
                        <button onClick={() => setFontSize(f => Math.min(24, f + 1))} title="Aumentar fonte" style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '5px 10px', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-3)', lineHeight: 1 }}>A+</button>
                    </div>

                    {/* Separador */}
                    <div style={{ width: 1, height: 28, background: 'var(--border)', margin: '0 4px' }} />

                    {/* PDF */}
                    <button
                        onClick={() => window.print()}
                        title="Gerar PDF completo da lista filtrada"
                        style={{ border: '1px solid var(--border)', background: 'var(--surface2)', cursor: 'pointer', padding: '6px 10px', borderRadius: 10, fontSize: '1rem', lineHeight: 1, transition: 'all 0.15s', color: 'var(--text-2)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface3, var(--border))'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                    >🖨️</button>

                    {/* Ajuda */}
                    <button
                        onClick={() => setShowHelp(true)}
                        title="Tutorial do sistema"
                        style={{ border: '1px solid var(--border)', background: 'var(--surface2)', cursor: 'pointer', padding: '6px 10px', borderRadius: 10, fontSize: '1rem', lineHeight: 1, transition: 'all 0.15s', color: 'var(--text-2)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface3, var(--border))'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                    >❓</button>

                    {/* Separador */}
                    <div style={{ width: 1, height: 28, background: 'var(--border)', margin: '0 4px' }} />

                    {/* Modo Foco — destaque */}
                    <button
                        onClick={() => setIsFocusMode(!isFocusMode)}
                        title={isFocusMode ? 'Sair do Modo Foco' : 'Entrar no Modo Foco — oculta filtros e header'}
                        style={{ border: 'none', cursor: 'pointer', padding: '6px 14px', borderRadius: 10, fontSize: '0.78rem', fontWeight: 900, transition: 'all 0.15s', background: isFocusMode ? '#f59e0b' : 'linear-gradient(135deg, var(--accent), #0ea5e9)', color: '#fff', boxShadow: isFocusMode ? '0 2px 8px rgba(245,158,11,0.35)' : '0 2px 8px rgba(20,184,166,0.25)', letterSpacing: '0.02em' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >{isFocusMode ? '🔓 Sair' : '🎯 Foco'}</button>
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
                        <button className={`btn-tag ${filterOnlyErrors ? 'active' : ''}`} onClick={() => { setFilterOnlyErrors(!filterOnlyErrors); setFilterHideRead(false); setFilterOnlyFavorites(false); }} style={{ fontSize: '0.7rem', padding: '4px 10px', background: filterOnlyErrors ? 'var(--rose)' : 'transparent', color: filterOnlyErrors ? '#fff' : 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 20, fontWeight: 700 }}>❌ Erros</button>
                    </div>
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

                {loading ? <div style={{ padding: '5rem', textAlign: 'center', opacity: 0.5 }}>Carregando julgados...</div> :
                    (groupedPrecedents ? groupedPrecedents.map(([subName, list]) => (
                        <div key={subName} style={{ marginBottom: isFocusMode ? '3rem' : '1.5rem' }}>
                            <div className="subject-header"><h3>📚 {subName}</h3><div className="line" /><span>{list.length}</span></div>
                            {list.map(renderPrecedent)}
                        </div>
                    )) : filtered.map(renderPrecedent))}
            </div>

            {showHelp && (
                <div className="modal-overlay" style={{ zIndex: 20000 }} onClick={() => setShowHelp(false)}>
                    <div onClick={e => e.stopPropagation()} style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border-strong)',
                        borderRadius: 24,
                        padding: '2.5rem',
                        maxWidth: '480px',
                        width: '100%',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                        animation: 'modalIn 0.2s ease',
                        textAlign: 'center',
                        position: 'relative',
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
                                'Clique em qualquer card para marcá-lo como "Lido". Use os botões verde (+1) e vermelho (-1) para registrar quantas vezes você revisou aquele tema.',
                                'O clique no card marca leitura. Para ver o relator, data exata e link do inteiro teor, clique no número do processo (ex: 🔍 RE 1.234).',
                                'Gosta de Flashcards? Mude para o modo V/F no topo. O sistema esconderá a tese e você deverá julgar se a afirmação é verdadeira ou falsa.',
                                'Ao filtrar por STF ou STJ, um novo campo aparecerá para você escolher o número específico do informativo que deseja focar.'
                            ][helpStep]}
                        </p>

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
                    .prec-item { break-inside: avoid; border: 1px solid #eee !important; margin-bottom: 0.5rem !important; padding: 0.75rem !important; border-radius: 4px !important; } 
                    .prec-title { color: black !important; font-size: 1.1rem !important; margin-bottom: 0.3rem !important; }
                    .prec-list { padding: 0 !important; }
                    .subject-header { margin-bottom: 0.5rem !important; }
                    body { background: white !important; }
                }
            `}</style>
            <div className="no-print" style={{ textAlign: 'center', padding: '3rem', opacity: 0.3, fontSize: '0.65rem' }}>v{APP_VERSION}</div>
        </div>
    );
}
