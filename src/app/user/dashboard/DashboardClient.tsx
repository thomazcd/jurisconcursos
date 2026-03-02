'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { signOut } from 'next-auth/react';
import { APP_VERSION } from '@/lib/version';
import { Icons as SvgIcons } from '@/components/ui/Icons';

type Subject = { id: string; name: string; total: number; readCount: number; unreadCount: number };
type Precedent = {
    id: string; title: string; summary: string; court: string;
    judgmentDate?: string | null; publicationDate?: string | null;
    processClass?: string | null; processNumber?: string | null;
    informatoryNumber?: string | null; informatoryYear?: number | null;
    organ?: string | null; rapporteur?: string | null;
    theme?: string | null; isRG: boolean; fullTextOrLink?: string | null;
    readCount: number; isRead: boolean; readEvents: string[];
    subjects: { id: string; name: string }[];
    flashcardQuestion?: string | null;
    flashcardAnswer?: boolean;
    correctCount?: number;
    wrongCount?: number;
    lastResult?: 'HIT' | 'MISS' | null;
    isFavorite: boolean;
    notes?: string | null;
};

interface Props { userName: string; track: string; }

const TRACK_LABELS: Record<string, React.ReactNode> = {
    JUIZ_ESTADUAL: <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><SvgIcons.Scale size={16} /> Juiz Estadual</span>,
    JUIZ_FEDERAL: <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><SvgIcons.Landmark size={16} /> Juiz Federal</span>,
    PROCURADOR: <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><SvgIcons.Briefcase size={16} /> Procurador</span>,
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
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark-theme'));
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        document.documentElement.classList.toggle('dark-theme', next);
        localStorage.setItem('juris-theme', next ? 'dark' : 'light');
    };

    const ThemeIcons = {
        sun: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
        moon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
    };

    const [selectedPrecedent, setSelectedPrecedent] = useState<Precedent | null>(null);
    const [historyModal, setHistoryModal] = useState<{ id: string, events: string[] } | null>(null);
    const [notesModal, setNotesModal] = useState<{ id: string, notes: string | null } | null>(null);
    const [showHints, setShowHints] = useState<Record<string, boolean>>({});

    const loadSubjects = useCallback(() => {
        fetch('/api/user/subjects')
            .then(r => r.json())
            .then(d => setSubjects(d.subjects ?? []));
    }, [track]);

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
    }, [track]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadPrecedents(selectedSubject, search);
        }, search ? 500 : 0);
        return () => clearTimeout(timeoutId);
    }, [selectedSubject, search, loadPrecedents, track]);

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
            const readData = readMap[p.id] || { count: 0, events: [], correct: 0, wrong: 0, last: null, isFavorite: false, notes: null };
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
        if (selectedSubject !== 'ALL') return null;

        const groups: Record<string, Precedent[]> = {};
        filtered.forEach(p => {
            const subs = p.subjects && p.subjects.length > 0 ? p.subjects : [{ name: 'Geral', id: 'geral' }];
            subs.forEach(s => {
                const subName = s.name;
                if (!groups[subName]) groups[subName] = [];
                // Evitar o mesmo precedente no mesmo grupo por engano, mas permitir em grupos diferentes
                groups[subName].push(p);
            });
        });

        // Ordenar grupos alfabeticamente, mas colocar 'Geral' por último se existir
        return Object.entries(groups)
            .filter(([_, list]) => list.length > 0)
            .sort(([a], [b]) => {
                if (a === 'Geral') return 1;
                if (b === 'Geral') return -1;
                return a.localeCompare(b);
            });
    }, [selectedSubject, filtered]);

    const renderPrecedent = (p: Precedent, currentSubjectContext?: string) => {
        const readData = readMap[p.id] || { count: 0, events: [], correct: 0, wrong: 0, last: null, isFavorite: false, notes: null };
        const isRead = readData.count > 0;
        const isRevealed = studyMode === 'READ' || revealed[p.id];

        // Handle multiple process numbers: show only the first in the list
        const firstProcNumber = p.processNumber ? p.processNumber.split(',')[0].trim() : '';
        const procList = [p.processClass, firstProcNumber].filter(Boolean).join(' ');
        const flashResult = flashcardResults[p.id];

        return (
            <div
                key={`${p.id}-${currentSubjectContext || 'all'}`}
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
                        {p.theme && p.theme.includes('|') && p.theme.split('|')[0].trim() !== '' && (
                            <span style={{ fontSize: '0.65em', background: 'rgba(201,138,0,0.1)', color: '#a06e00', padding: '2px 10px', borderRadius: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <SvgIcons.Pin size={10} /> {p.theme.split('|')[0].trim()}
                            </span>
                        )}
                        {p.subjects?.filter(s => {
                            if (!currentSubjectContext) return true;
                            const s1 = s.name.trim().toLowerCase();
                            const s2 = currentSubjectContext.trim().toLowerCase();
                            return s1 !== s2;
                        }).map(s => (
                            <span key={s.id} style={{ fontSize: '0.65em', background: 'rgba(20, 184, 166, 0.1)', color: 'var(--accent)', padding: '2px 10px', borderRadius: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <SvgIcons.BookOpen size={10} /> + {s.name}
                            </span>
                        ))}
                        {readData.last === 'HIT' && <span style={{ fontSize: '0.65em', background: '#dcfce7', color: '#166534', padding: '2px 10px', borderRadius: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}><SvgIcons.CheckCircle size={10} /> Dominado</span>}
                        {readData.last === 'MISS' && <span style={{ fontSize: '0.65em', background: '#fee2e2', color: '#991b1b', padding: '2px 10px', borderRadius: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}><SvgIcons.X size={10} /> Revisar</span>}
                        {isRead && <span style={{ fontSize: '0.65em', background: 'rgba(34, 197, 94, 0.1)', color: '#166534', padding: '2px 10px', borderRadius: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}><SvgIcons.Book size={10} /> Lido</span>}
                    </div>
                )}

                <div className="prec-title" style={{ fontSize: compactMode ? '0.9em' : '1.1em', fontWeight: 900, color: 'var(--text)', marginBottom: compactMode ? '0.25em' : '0.75em', lineHeight: '1.4', letterSpacing: '-0.01em' }}>{p.title}</div>

                {!isRevealed && studyMode === 'FLASHCARD' ? (
                    <div style={{ background: 'var(--surface2)', padding: '1.25rem', borderRadius: 14, border: '1px solid var(--border)', marginBottom: '0.75rem' }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '1.05em', color: 'var(--text)', fontWeight: 600, marginBottom: '1rem', lineHeight: '1.5' }}>{p.flashcardQuestion || p.summary}</div>
                        <div style={{ display: 'flex', gap: '0.6rem' }}>
                            <button onClick={(e) => { e.stopPropagation(); handleFlashcard(p, true); }} className="btn btn-sm" style={{ flex: 1, background: '#10b981', color: '#fff', fontWeight: 800, height: '38px', borderRadius: 10 }}>VERDADEIRO</button>
                            <button onClick={(e) => { e.stopPropagation(); handleFlashcard(p, false); }} className="btn btn-sm" style={{ flex: 1, background: '#ef4444', color: '#fff', fontWeight: 800, height: '38px', borderRadius: 10 }}>FALSO</button>
                        </div>
                    </div>
                ) : (
                    <div style={{ marginBottom: compactMode ? '0.5rem' : '1rem' }}>
                        {flashResult && <div style={{ padding: '0.5em 0.75em', marginBottom: '0.5em', borderRadius: 8, background: flashResult === 'CORRECT' ? '#dcfce7' : '#fee2e2', color: flashResult === 'CORRECT' ? '#166534' : '#991b1b', fontWeight: 900, fontSize: '0.8em', border: `1px solid ${flashResult === 'CORRECT' ? '#bcf0da' : '#fecaca'}` }}>{flashResult === 'CORRECT' ? '🎯 ACERTOU!' : '❌ ERROU!'}</div>}

                        <div className="tese-text" style={{
                            fontSize: compactMode ? '0.85em' : '0.98em',
                            color: 'var(--text-2)',
                            lineHeight: compactMode ? '1.4' : '1.5',
                            fontWeight: 600,
                            padding: compactMode ? '0' : '2px 0',
                        }}>
                            {p.summary}
                        </div>
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
                                {readData.isFavorite ? <SvgIcons.Star size={16} fill="#f59e0b" color="#f59e0b" /> : <SvgIcons.Star size={16} />}
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
                                <SvgIcons.MessageSquare size={16} />
                                {readData.notes && <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%', border: '2px solid var(--surface1)' }} />}
                            </button>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-3)', padding: '2px 0', whiteSpace: 'nowrap', fontSize: '0.7rem' }}>
                                <SvgIcons.Landmark size={11} /> {p.court} {p.informatoryNumber}{p.informatoryYear ? `/${p.informatoryYear}` : ''}
                            </span>

                            <span
                                onClick={(e) => { e.stopPropagation(); setSelectedPrecedent(p); }}
                                style={{ cursor: 'pointer', padding: '2px 0', color: 'var(--text-3)', fontSize: '0.7rem' }}
                                title="Clique para ver detalhes e inteiro teor"
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                            >
                                <SvgIcons.Search size={11} /> {procList}
                            </span>

                            {p.organ && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-3)', padding: '2px 0', whiteSpace: 'nowrap', fontSize: '0.7rem', fontWeight: 800 }}><SvgIcons.Gavel size={11} /> {p.organ}</span>}

                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-3)', padding: '2px 0', whiteSpace: 'nowrap', fontSize: '0.7rem' }}>
                                <SvgIcons.User size={11} />
                                {p.rapporteur?.includes('Rel. p/ acórdão') ? p.rapporteur.split(',').find(s => s.includes('Rel. p/ acórdão'))?.trim() : (p.rapporteur || '---')}
                            </span>

                            {p.judgmentDate && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}><SvgIcons.Calendar size={11} /> Jul: {new Date(p.judgmentDate).toLocaleDateString('pt-BR')}</span>}
                            <span
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: !p.publicationDate ? 'help' : 'default', fontSize: '0.7rem' }}
                                title={!p.publicationDate ? "Na publicação do informativo não foi informada data de publicação do julgado." : undefined}
                            >
                                <SvgIcons.FileText size={11} /> Publ: {p.publicationDate ? new Date(p.publicationDate).toLocaleDateString('pt-BR') : '--'}
                            </span>
                            {(readData.correct > 0 || readData.wrong > 0) && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-3)', opacity: 0.8, background: 'var(--surface2)', padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem' }}><SvgIcons.Chart size={11} /> {readData.correct}V | {readData.wrong}F</span>}
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
                                        style={{ marginLeft: '4px', background: 'var(--surface2)', padding: '4px 10px', borderRadius: 8, fontWeight: 800, color: 'var(--text-2)', cursor: 'pointer', fontSize: '0.75rem' }}
                                        onClick={(e) => { e.stopPropagation(); setHistoryModal({ id: p.id, events: readData.events || [] }); }}
                                        title="Clique para ver o histórico de leituras"
                                    >
                                        {readData.count}×
                                    </div>
                                    <button onClick={(e) => resetRead(p.id, e)} className="no-print" style={{ border: 'none', background: 'transparent', padding: '0 4px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-4)', opacity: 0.5 }} title="Marcar como Não Lido"><SvgIcons.RefreshCw size={12} /></button>
                                </div>
                            )}
                            {!isRead && (
                                <button
                                    className="btn no-print"
                                    style={{
                                        padding: '4px 12px',
                                        fontWeight: 800,
                                        borderRadius: 8,
                                        fontSize: '0.75rem',
                                        background: 'var(--surface2)',
                                        border: '1px solid var(--border)',
                                        color: 'var(--text-3)',
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={(e) => markRead(p.id, e)}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)'; }}
                                >
                                    Marcar Lido
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
                                        <SvgIcons.Lightbulb size={16} /> Ver Dica (Recuperar Memória)
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
                    <div className="modal-content-animated" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '500px', padding: '2rem', borderRadius: '24px', background: 'var(--surface)', border: '1px solid var(--border-strong)', boxShadow: '0 30px 60px rgba(0,0,0,0.3)', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}><SvgIcons.MessageSquare size={24} /> Minhas Anotações</h3>
                            <button onClick={() => setNotesModal(null)} style={{ border: 'none', background: 'var(--surface2)', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontWeight: 900, display: 'flex', alignItems: 'center', justifySelf: 'center', padding: 8 }}><SvgIcons.X size={16} /></button>
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
                    <div className="modal-content" style={{ maxWidth: '650px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header" style={{ position: 'relative', justifyContent: 'center', padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                            <h2 style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-3)', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}><SvgIcons.Search size={14} /> Detalhes do Julgado</h2>
                            <button
                                onClick={() => { setSelectedPrecedent(null); setIsFocusMode(false); }}
                                className="btn-close"
                                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', padding: 8, background: 'var(--surface2)', borderRadius: '50%' }}
                            ><SvgIcons.X size={16} /></button>
                        </div>

                        <div className="modal-body" style={{ overflowY: 'auto', padding: '1.25rem 1.75rem', fontSize: '0.9rem' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{
                                    fontSize: '1.2rem',
                                    fontWeight: 900,
                                    color: 'var(--text)',
                                    marginBottom: '1rem',
                                    lineHeight: '1.3',
                                    letterSpacing: '-0.01em',
                                    display: 'block',
                                    wordWrap: 'break-word',
                                    overflowWrap: 'break-word'
                                }}>{selectedPrecedent.theme?.includes('|') ? selectedPrecedent.theme.split('|')[1].trim() : selectedPrecedent.title}</h3>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                                    gap: '1rem',
                                    padding: '1.25rem',
                                    background: 'var(--surface2)',
                                    borderRadius: 12,
                                    fontSize: '0.8rem',
                                    color: 'var(--text-2)',
                                    border: '1px solid var(--border)',
                                    marginBottom: '1.5rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <strong style={{ color: 'var(--text-3)', display: 'inline-flex', alignItems: 'center', gap: '4px', minWidth: '85px' }}>
                                            <SvgIcons.Pin size={12} /> Tema:
                                        </strong>
                                        <span>{(selectedPrecedent.theme?.includes('|') && selectedPrecedent.theme.split('|')[0].trim()) || 'Não afetado'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <strong style={{ color: 'var(--text-3)', display: 'inline-flex', alignItems: 'center', gap: '4px', minWidth: '85px' }}>
                                            <SvgIcons.Landmark size={12} /> Tribunal:
                                        </strong>
                                        <span>{selectedPrecedent.court}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <strong style={{ color: 'var(--text-3)', display: 'inline-flex', alignItems: 'center', gap: '4px', minWidth: '85px' }}>
                                            <SvgIcons.FileText size={12} /> Informativo:
                                        </strong>
                                        <span>{selectedPrecedent.informatoryNumber}{selectedPrecedent.informatoryYear ? `/${selectedPrecedent.informatoryYear}` : ''}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <strong style={{ color: 'var(--text-3)', display: 'inline-flex', alignItems: 'center', gap: '4px', minWidth: '85px' }}>
                                            <SvgIcons.Scale size={12} /> Processo:
                                        </strong>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>{[selectedPrecedent.processClass, selectedPrecedent.processNumber].filter(Boolean).join(' ') || '---'}</span>
                                            {selectedPrecedent.processNumber && (
                                                <button
                                                    onClick={(e) => copyToClipboard(selectedPrecedent.processNumber || '', 'modal-' + selectedPrecedent.id, e)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        border: '1px solid var(--border)',
                                                        background: 'var(--surface2)',
                                                        padding: '2px 8px',
                                                        borderRadius: '6px',
                                                        color: copying === 'modal-' + selectedPrecedent.id ? 'var(--accent)' : 'var(--text-3)',
                                                        fontSize: '0.65rem',
                                                        fontWeight: 900,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    title="Copiar número do processo"
                                                >
                                                    {copying === 'modal-' + selectedPrecedent.id ? (
                                                        <><SvgIcons.Check size={10} /> número do processo copiado</>
                                                    ) : (
                                                        <><SvgIcons.Copy size={10} /> Copiar</>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <strong style={{ color: 'var(--text-3)', display: 'inline-flex', alignItems: 'center', gap: '4px', minWidth: '85px' }}>
                                            <SvgIcons.User size={12} /> Relator:
                                        </strong>
                                        <span>{selectedPrecedent.rapporteur || '---'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <strong style={{ color: 'var(--text-3)', display: 'inline-flex', alignItems: 'center', gap: '4px', minWidth: '85px' }}>
                                            <SvgIcons.Gavel size={12} /> Órgão:
                                        </strong>
                                        <span>{selectedPrecedent.organ || '---'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <strong style={{ color: 'var(--text-3)', display: 'inline-flex', alignItems: 'center', gap: '4px', minWidth: '85px' }}>
                                            <SvgIcons.Calendar size={12} /> Publicação:
                                        </strong>
                                        <span>{selectedPrecedent.publicationDate ? new Date(selectedPrecedent.publicationDate).toLocaleDateString('pt-BR') : '--'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <strong style={{ color: 'var(--text-3)', display: 'inline-flex', alignItems: 'center', gap: '4px', minWidth: '85px' }}>
                                            <SvgIcons.Scale size={12} /> Julgamento:
                                        </strong>
                                        <span>{selectedPrecedent.judgmentDate ? new Date(selectedPrecedent.judgmentDate).toLocaleDateString('pt-BR') : '---'}</span>
                                    </div>
                                </div>

                                <div style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 900,
                                    color: 'var(--text-3)',
                                    textTransform: 'uppercase',
                                    marginBottom: '4px',
                                    letterSpacing: '0.05em'
                                }}>
                                    DESTAQUE:
                                </div>
                                <div style={{
                                    fontSize: '0.92em',
                                    fontWeight: 700,
                                    color: 'var(--text-2)',
                                    marginBottom: '1.5rem',
                                    lineHeight: '1.5'
                                }}>
                                    {selectedPrecedent.summary}
                                </div>

                                {selectedPrecedent.fullTextOrLink && !selectedPrecedent.fullTextOrLink.startsWith('http') && (
                                    <>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <SvgIcons.FileText size={12} /> INFORMAÇÕES DO INTEIRO TEOR:
                                        </div>
                                        <div style={{
                                            fontSize: '0.85em',
                                            color: 'var(--text-2)',
                                            lineHeight: '1.7',
                                            padding: '0',
                                            textAlign: 'justify',
                                            hyphens: 'auto'
                                        }}>
                                            {selectedPrecedent.fullTextOrLink.split('\n').map((line, i) => (
                                                <p key={i} style={{ marginBottom: line.trim() ? '1.2em' : '0' }}>{line}</p>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)', padding: '1rem', borderRadius: '0 0 24px 24px', justifyContent: 'center' }}>
                            {selectedPrecedent.fullTextOrLink && selectedPrecedent.fullTextOrLink.startsWith('http') && (
                                <a href={selectedPrecedent.fullTextOrLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ minWidth: '150px', display: 'flex', alignItems: 'center', gap: '8px' }}><SvgIcons.ExternalLink size={16} /> Ver Inteiro Teor Online</a>
                            )}
                            {(!selectedPrecedent.fullTextOrLink || !selectedPrecedent.fullTextOrLink.startsWith('http')) && (
                                <button onClick={() => setSelectedPrecedent(null)} className="btn btn-ghost" style={{ fontSize: '0.8rem', fontWeight: 800 }}>Fechar Detalhes</button>
                            )}
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
                            style={{ padding: '6px 16px', borderRadius: 9, fontSize: '0.78rem', fontWeight: 800, border: 'none', cursor: 'pointer', transition: 'all 0.15s', background: studyMode === 'READ' ? 'var(--accent)' : 'transparent', color: studyMode === 'READ' ? '#fff' : 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '6px' }}
                        ><SvgIcons.Book size={14} /> Leitura</button>
                        <button
                            onClick={() => setStudyMode('FLASHCARD')}
                            style={{ padding: '6px 16px', borderRadius: 9, fontSize: '0.78rem', fontWeight: 800, border: 'none', cursor: 'pointer', transition: 'all 0.15s', background: studyMode === 'FLASHCARD' ? 'var(--accent)' : 'transparent', color: studyMode === 'FLASHCARD' ? '#fff' : 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '6px' }}
                        ><SvgIcons.Brain size={14} /> V/F</button>
                    </div>

                    <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

                    {/* Visualização */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <button
                            onClick={() => setCompactMode(c => !c)}
                            title={compactMode ? 'Modo completo' : 'Modo compacto: só título e tese'}
                            style={{ padding: '6px 14px', borderRadius: 10, fontSize: '0.78rem', fontWeight: 800, border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.15s', background: compactMode ? 'var(--accent)' : 'var(--surface2)', color: compactMode ? '#fff' : 'var(--text-3)', height: '34px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >{compactMode ? <><SvgIcons.Minimize2 size={14} /> Compacto</> : <><SvgIcons.Layout size={14} /> Compacto</>}</button>

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
                    >{isFocusMode ? <><SvgIcons.Unlock size={14} /> SAIR FOCO</> : <><SvgIcons.Target size={14} /> MODO FOCO</>}</button>
                    <button
                        onClick={toggleTheme}
                        style={{
                            background: 'var(--surface2)',
                            border: '1px solid var(--border)',
                            borderRadius: 12,
                            width: 36,
                            height: 36,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--text-3)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
                    >
                        {isDark ? ThemeIcons.sun : ThemeIcons.moon}
                    </button>
                </div>
            </div>


            <div className={`no-print ${isFocusMode ? 'hidden-focus' : ''}`} style={{ background: 'var(--surface)', padding: '1rem', borderRadius: 16, marginBottom: '1rem', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} style={{ flex: '0 0 240px', padding: '0.5rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', fontWeight: 600, fontSize: '0.85rem' }}>
                        <option value="ALL">Todas as Matérias</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}><SvgIcons.Search size={16} /></span>
                        <input type="search" placeholder="Buscar em tudo..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '0.85rem' }} />
                    </div>
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
                        <button className={`btn-tag ${filterOnlyFavorites ? 'active' : ''}`} onClick={() => { setFilterOnlyFavorites(!filterOnlyFavorites); setFilterHideRead(false); setFilterOnlyErrors(false); }} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', padding: '4px 10px', background: filterOnlyFavorites ? 'var(--accent)' : 'transparent', color: filterOnlyFavorites ? '#fff' : 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 20, fontWeight: 700 }}>
                            <SvgIcons.Star size={12} fill={filterOnlyFavorites ? '#fff' : 'none'} /> Favoritos
                        </button>
                        <button className={`btn-tag ${filterHideRead ? 'active' : ''}`} onClick={() => { setFilterHideRead(!filterHideRead); setFilterOnlyFavorites(false); setFilterOnlyErrors(false); }} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', padding: '4px 10px', background: filterHideRead ? 'var(--accent)' : 'transparent', color: filterHideRead ? '#fff' : 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 20, fontWeight: 700 }}>
                            <SvgIcons.Sparkles size={12} /> Não Lidos
                        </button>
                        <button className={`btn-tag ${filterOnlyErrors ? 'active' : ''}`} onClick={() => { setFilterOnlyErrors(!filterOnlyErrors); setFilterHideRead(false); setFilterOnlyFavorites(false); }} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', padding: '4px 10px', background: filterOnlyErrors ? 'var(--rose)' : 'transparent', color: filterOnlyErrors ? '#fff' : 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 20, fontWeight: 700 }}>
                            <SvgIcons.X size={12} /> Erros
                        </button>
                    </div>
                </div>
            </div>

            {/* Barra flutuante do Modo Foco */}
            {
                isFocusMode && (
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
                            style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => setIsFocusMode(false)}
                            title="Sair do Modo Foco"
                        >
                            <SvgIcons.Minimize2 size={14} /> Sair Foco
                        </button>

                        <button
                            onClick={toggleTheme}
                            style={{
                                background: 'var(--surface2)',
                                border: '1px solid var(--border)',
                                borderRadius: 12,
                                width: 32,
                                height: 32,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'var(--text-3)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                            title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
                        >
                            {isDark ? ThemeIcons.sun : ThemeIcons.moon}
                        </button>

                        <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 2px' }} />

                        <button
                            className={`btn btn-sm ${compactMode ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                            onClick={() => setCompactMode(c => !c)}
                            title={compactMode ? 'Voltar ao modo completo' : 'Modo compacto: só título e tese'}
                        >{compactMode ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><SvgIcons.Layout size={14} /> Completo</span> : <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><SvgIcons.Minimize2 size={14} /> Compacto</span>}</button>

                        <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 2px' }} />

                        <button className="btn btn-ghost btn-xs" style={{ fontSize: '0.75rem' }} onClick={() => setFontSize(f => Math.max(10, f - 1))} title="Diminuir fonte">A-</button>
                        <button className="btn btn-ghost btn-xs" style={{ fontSize: '0.75rem' }} onClick={() => setFontSize(f => Math.min(24, f + 1))} title="Aumentar fonte">A+</button>
                    </div>
                )
            }

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
                    <div key={subName} style={{ marginBottom: isFocusMode ? '1rem' : '0.5rem' }}>
                        <div className="subject-header">
                            <div className="subject-icon">
                                <SvgIcons.BookOpen size={20} />
                            </div>
                            <h3>{subName}</h3>
                            <div className="line" />
                            <span>{list.length}</span>
                        </div>
                        {list.map(p => renderPrecedent(p, subName as string))}
                    </div>
                )) : filtered.map(p => {
                    const currentSubName = subjects.find(s => s.id === selectedSubject)?.name;
                    return renderPrecedent(p, currentSubName);
                }))}
            </div>

            {
                showHelp && (
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

                            {/* Ícone com fundo colorido */}
                            <div style={{ width: 72, height: 72, borderRadius: '22px', background: 'linear-gradient(135deg, var(--accent), #14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', margin: '0 auto 1.25rem', boxShadow: '0 10px 25px rgba(20,184,166,0.3)', transform: 'rotate(-5deg)' }}>
                                {[
                                    <SvgIcons.Sparkles size={36} key="s0" />,
                                    <SvgIcons.Gavel size={36} key="s1" />,
                                    <SvgIcons.Layout size={36} key="s2" />,
                                    <SvgIcons.Copy size={36} key="s3" />,
                                    <SvgIcons.Brain size={36} key="s4" />,
                                    <SvgIcons.Target size={36} key="s5" />,
                                    <SvgIcons.RotateCw size={36} key="s6" />
                                ][helpStep]}
                            </div>

                            {/* Título */}
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)', marginBottom: '0.75rem' }}>
                                {[
                                    'Bem-vindo ao Novo Juris!',
                                    'Fidelidade Jurisdicional',
                                    'Inteiro Teor Premium',
                                    'Agilidade no Estudo',
                                    'Flashcards (V/F)',
                                    'Foco e Visualização',
                                    'Filtros e Matérias'
                                ][helpStep]}
                            </h2>

                            {/* Descrição */}
                            <div style={{ color: 'var(--text-2)', lineHeight: '1.7', fontSize: '0.92rem', marginBottom: '2rem', background: 'var(--surface2)', borderRadius: 16, padding: '1.25rem', border: '1px solid var(--border)', textAlign: 'left' }}>
                                {[
                                    'A interface do Juris foi otimizada para sua aprovação. Desenvolvemos uma experiência fluida, premium e focada no alto rendimento. Vamos explorar as ferramentas fundamentais para sua jornada!',
                                    'Implementamos precisão total para o STJ. Agora você visualiza o Órgão Julgador (Turmas/Seções) e a distinção clara entre Relator original e para Acórdão, garantindo que você estude com os dados exatos do informativo.',
                                    'A leitura do informativo nunca foi tão agradável. Reconstruímos os parágrafos do Inteiro Teor, eliminando quebras de linha fragmentadas e preservando a estrutura jurídica original para um estudo sem esforço.',
                                    'Facilitamos sua vida acadêmica. Ao abrir um card, você encontrará um botão para copiar o número do processo com um clique. Ideal para buscas rápidas ou citações em petições e resumos.',
                                    'Estudo ativo é a chave. No topo, mude para "V/F" e teste seus conhecimentos. O sistema oculta a tese, permitindo que você julgue o item. Estatísticas em tempo real mostram seus pontos fortes e fracos.',
                                    'Elimine distrações com o MODO FOCO. Se preferir uma visão ampla, o "Modo Compacto" permite visualizar dezenas de teses simultaneamente. Ajuste o tamanho da fonte para o conforto total dos olhos.',
                                    'Agrupamos julgados por matéria automaticamente. Use a barra de pesquisa para encontrar palavras-chave. Filtre por Tribunal ou Informativo específico para nichar seu estudo de forma estratégica.'
                                ][helpStep]}
                            </div>

                            {helpStep === 6 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg)', borderRadius: 16, border: '1px solid var(--border)' }}>
                                    <div style={{ textAlign: 'left', marginBottom: '0.5rem' }}>
                                        <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.25rem' }}>Zona de Gerenciamento</h4>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Atenção: estas ações limpam seu progresso local.</p>
                                    </div>
                                    <div
                                        className="btn btn-secondary"
                                        style={{ color: 'var(--rose)', borderColor: 'rgba(239, 68, 68, 0.2)', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'default', opacity: 0.8 }}
                                    ><SvgIcons.RotateCcw size={14} /> Marcar TUDO como Não Lido</div>
                                    <div
                                        className="btn btn-secondary"
                                        style={{ fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'default', opacity: 0.8 }}
                                    ><SvgIcons.RotateCw size={14} /> Zerar Estatísticas de V/F</div>
                                </div>
                            )}

                            {/* Pontos de progresso */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                {[0, 1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} onClick={() => setHelpStep(i)} style={{ width: i === helpStep ? 24 : 8, height: 8, borderRadius: 99, background: i === helpStep ? 'var(--accent)' : 'var(--border-strong)', cursor: 'pointer', transition: 'all 0.2s' }} />
                                ))}
                            </div>

                            {/* Botões */}
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                                {helpStep > 0 && <button className="btn btn-secondary" onClick={() => setHelpStep(helpStep - 1)}>← Voltar</button>}
                                <button className="btn btn-primary" onClick={() => helpStep < 6 ? setHelpStep(helpStep + 1) : setShowHelp(false)} style={{ borderRadius: 12, padding: '0 2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {helpStep < 6 ? 'Próximo →' : <><SvgIcons.CheckCircle size={18} /> Entendi!</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }



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
                .subject-header { 
                    display: flex; 
                    align-items: center; 
                    gap: 0.8rem; 
                    margin: 1.5rem 0 1rem;
                    padding: 0.5rem 0;
                }
                .subject-icon { 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    width: 44px; 
                    height: 44px; 
                    border-radius: 14px; 
                    background: linear-gradient(135deg, var(--surface2), var(--surface3));
                    color: var(--accent); 
                    border: 1px solid var(--border);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                }
                .subject-header h3 { 
                    font-size: 1.25rem; 
                    font-weight: 950; 
                    color: var(--text); 
                    letter-spacing: -0.04em; 
                    white-space: nowrap; 
                    margin: 0;
                    text-transform: capitalize;
                }
                .subject-header .line { 
                    flex: 1; 
                    height: 2px; 
                    background: linear-gradient(to right, var(--accent), transparent); 
                    opacity: 0.15; 
                    border-radius: 2px;
                }
                .subject-header span { 
                    font-size: 0.8rem; 
                    font-weight: 900; 
                    color: var(--accent); 
                    background: rgba(20, 184, 166, 0.1); 
                    padding: 4px 12px; 
                    border-radius: 10px;
                    border: 1px solid rgba(20, 184, 166, 0.2);
                    box-shadow: 0 2px 8px rgba(20, 184, 166, 0.05);
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
            {
                historyModal && (
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
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <SvgIcons.History size={18} style={{ color: 'var(--accent)' }} /> Histórico de Leitura
                            </h3>
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
                )
            }

            <div className="no-print" style={{ textAlign: 'center', padding: '3rem 3rem 2rem', opacity: 0.3, fontSize: '0.65rem', lineHeight: 1.8 }}>
                v{APP_VERSION}<br />Desenvolvido por Thomaz C. Drumond
            </div>
        </div >
    );
}
