'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { signOut } from 'next-auth/react';
import useSWR from 'swr';
import { APP_VERSION } from '@/lib/version';
import { Icons as SvgIcons } from '@/components/ui/Icons';

const fetcher = (url: string) => fetch(url).then(res => res.json());

import { PrecedentCard } from './components/PrecedentCard';
import { NotesModal } from './components/NotesModal';
import { PrecedentDetailsModal } from './components/PrecedentDetailsModal';
import { HistoryModal } from './components/HistoryModal';
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardFilters } from './components/DashboardFilters';
import { FocusModeOverlay } from './components/FocusModeOverlay';
import { PrecedentList } from './components/PrecedentList';
import { HelpModal } from './components/HelpModal';
import { Subject, Precedent } from './types';

interface Props { userName: string; track: string; }

const TRACK_LABELS: Record<string, React.ReactNode> = {
    JUIZ_ESTADUAL: <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><SvgIcons.Scale size={16} /> Juiz Estadual</span>,
    JUIZ_FEDERAL: <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><SvgIcons.Landmark size={16} /> Juiz Federal</span>,
    PROCURADOR: <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><SvgIcons.Briefcase size={16} /> Procurador</span>,
};

export default function DashboardClient({ userName, track }: Props) {
    const [selectedSubject, setSelectedSubject] = useState('ALL');
    const [readMap, setReadMap] = useState<Record<string, { count: number, events: string[], correct: number, wrong: number, last: string | null, isFavorite: boolean, notes: string | null }>>({});
    const [search, setSearch] = useState('');
    const [isMutating, setIsMutating] = useState(false);
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

    const { data: subData, mutate: mutateSubjects } = useSWR('/api/user/subjects', fetcher);
    const subjects: Subject[] = subData?.subjects ?? [];

    const precUrl = selectedSubject === 'ALL' ? '/api/user/precedents' : `/api/user/precedents?subjectId=${selectedSubject}`;
    const searchParam = search ? (precUrl.includes('?') ? `&q=${encodeURIComponent(search)}` : `?q=${encodeURIComponent(search)}`) : '';
    const finalUrl = `${precUrl}${searchParam}`;

    const { data: precData, isValidating: loading, mutate: mutatePrecedents } = useSWR(finalUrl, fetcher, {
        keepPreviousData: true,
        revalidateOnFocus: false,
    });

    const precedents: Precedent[] = precData?.precedents ?? [];

    // Sync SWR Data with Local Optimistic Map whenever new data arrives from server
    useEffect(() => {
        if (!precData?.precedents) return;
        const map: Record<string, any> = {};
        precData.precedents.forEach((p: Precedent) => {
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
        // Reset local hint reveals when new data sweeps in
        setRevealed({});
        setFlashcardResults({});
        setShowHints({});
    }, [precData]);

    useEffect(() => {
        if (isFocusMode) {
            document.body.classList.add('is-focus-mode');
        } else {
            document.body.classList.remove('is-focus-mode');
        }
        return () => document.body.classList.remove('is-focus-mode');
    }, [isFocusMode]);

    const loadSubjects = useCallback(() => {
        mutateSubjects();
    }, [mutateSubjects]);

    const loadPrecedents = useCallback(async () => {
        await mutatePrecedents();
    }, [mutatePrecedents]);


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
        setIsMutating(true);
        try {
            await fetch('/api/user/read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'bulk_reset_reads', precedentId: 'ALL' }),
            });
            await loadPrecedents();
            loadSubjects();
            setShowHelp(false);
            setHelpStep(0);
        } catch (err) {
            console.error(err);
            alert('Erro ao resetar leituras');
        } finally {
            setIsMutating(false);
        }
    }

    async function resetAllStats() {
        if (!confirm('Deseja zerar TODAS as estatísticas de desempenho (V/F)?')) return;
        setIsMutating(true);
        try {
            await fetch('/api/user/read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'bulk_reset_stats', precedentId: 'ALL' }),
            });
            await loadPrecedents();
            loadSubjects();
            setShowHelp(false);
            setHelpStep(0);
        } catch (err) {
            console.error(err);
            alert('Erro ao resetar estatísticas');
        } finally {
            setIsMutating(false);
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

    return (
        <div className={`dashboard-container ${isFocusMode ? 'focus-mode-active' : ''}`} style={{ fontSize: `${fontSize}px` }}>
            {/* MODAL DE ANOTAÇÕES */}
            <NotesModal notesModal={notesModal} setNotesModal={setNotesModal} saveNote={saveNote} />

            {/* MODAL DETALHES DO JULGADO */}
            <PrecedentDetailsModal
                selectedPrecedent={selectedPrecedent}
                setSelectedPrecedent={setSelectedPrecedent}
                setIsFocusMode={setIsFocusMode}
                copyToClipboard={copyToClipboard}
                copyingId={copying}
            />

            <DashboardHeader
                isFocusMode={isFocusMode}
                setIsFocusMode={setIsFocusMode}
                studyMode={studyMode}
                setStudyMode={setStudyMode}
                compactMode={compactMode}
                setCompactMode={setCompactMode}
                setFontSize={setFontSize}
                toggleTheme={toggleTheme}
                isDark={isDark}
                setShowHelp={setShowHelp}
            />

            <DashboardFilters
                isFocusMode={isFocusMode}
                selectedSubject={selectedSubject}
                setSelectedSubject={setSelectedSubject}
                subjects={subjects}
                search={search}
                setSearch={setSearch}
                courtFilter={courtFilter}
                setCourtFilter={setCourtFilter}
                filteredCount={filtered.length}
                availableInformatories={availableInformatories}
                infFilter={infFilter}
                setInfFilter={setInfFilter}
                filterOnlyFavorites={filterOnlyFavorites}
                setFilterOnlyFavorites={setFilterOnlyFavorites}
                filterHideRead={filterHideRead}
                setFilterHideRead={setFilterHideRead}
                filterOnlyErrors={filterOnlyErrors}
                setFilterOnlyErrors={setFilterOnlyErrors}
            />

            {/* Barra flutuante do Modo Foco */}
            <FocusModeOverlay
                isFocusMode={isFocusMode}
                setIsFocusMode={setIsFocusMode}
                compactMode={compactMode}
                setCompactMode={setCompactMode}
                setFontSize={setFontSize}
                toggleTheme={toggleTheme}
                isDark={isDark}
            />

            <PrecedentList
                isFocusMode={isFocusMode}
                loading={loading}
                groupedPrecedents={groupedPrecedents}
                filtered={filtered}
                subjects={subjects}
                selectedSubject={selectedSubject}
                readMap={readMap}
                studyMode={studyMode}
                revealed={revealed}
                flashcardResults={flashcardResults}
                compactMode={compactMode}
                showHints={showHints}
                copyingId={copying}
                markRead={markRead}
                decrementRead={decrementRead}
                resetRead={resetRead}
                handleFlashcard={handleFlashcard}
                toggleFavorite={toggleFavorite}
                setNotesModal={setNotesModal}
                setHistoryModal={setHistoryModal}
                setSelectedPrecedent={setSelectedPrecedent}
                copyToClipboard={copyToClipboard}
                setShowHints={setShowHints}
            />

            <HelpModal
                showHelp={showHelp}
                setShowHelp={setShowHelp}
                helpStep={helpStep}
                setHelpStep={setHelpStep}
            />



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
            <HistoryModal historyModal={historyModal} setHistoryModal={setHistoryModal} />

            <div className="no-print" style={{ textAlign: 'center', padding: '3rem 3rem 2rem', opacity: 0.3, fontSize: '0.65rem', lineHeight: 1.8 }}>
                v{APP_VERSION}<br />Desenvolvido por Thomaz C. Drumond
            </div>
        </div>
    );
}
