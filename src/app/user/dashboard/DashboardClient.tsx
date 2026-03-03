'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { signOut } from 'next-auth/react';
import useSWR from 'swr';
import { APP_VERSION } from '@/lib/version';
import { Icons as SvgIcons } from '@/components/ui/Icons';

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(res => res.json());

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

interface Props { userName: string; }

export default function DashboardClient({ userName }: Props) {
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

    const [fontSize, setFontSize] = useState(14);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [compactMode, setCompactMode] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [helpStep, setHelpStep] = useState(0);
    const [isDark, setIsDark] = useState(false);

    // Nível 1: Escopo de Matérias (Enabled)
    const [enabledSubjectIds, setEnabledSubjectIds] = useState<string[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('juris-scope');
        if (saved) {
            try { setEnabledSubjectIds(JSON.parse(saved)); } catch (e) { console.error(e); }
        }
        setIsInitialized(true);
    }, []);

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('juris-scope', JSON.stringify(enabledSubjectIds));
        }
    }, [enabledSubjectIds, isInitialized]);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark-theme'));
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        document.documentElement.classList.toggle('dark-theme', next);
        localStorage.setItem('juris-theme', next ? 'dark' : 'light');
    };

    const [selectedPrecedent, setSelectedPrecedent] = useState<Precedent | null>(null);
    const [historyModal, setHistoryModal] = useState<{ id: string, events: string[] } | null>(null);
    const [notesModal, setNotesModal] = useState<{ id: string, notes: string | null } | null>(null);
    const [showHints, setShowHints] = useState<Record<string, boolean>>({});

    const { data: subData, mutate: mutateSubjects } = useSWR('/api/user/subjects', fetcher);
    const allSubjects: Subject[] = subData?.subjects ?? [];

    // Matérias disponíveis no seletor de baixo: Todas as "habilitadas" no topo
    const enabledSubjects = useMemo(() => {
        if (enabledSubjectIds.length === 0) return allSubjects;
        return allSubjects.filter(sf => enabledSubjectIds.includes(sf.id));
    }, [allSubjects, enabledSubjectIds]);

    const precUrl = useMemo(() => {
        const base = '/api/user/precedents';
        const params = new URLSearchParams();

        if (selectedSubject !== 'ALL') {
            params.set('subjectId', selectedSubject);
        } else if (enabledSubjectIds.length > 0) {
            enabledSubjectIds.forEach(id => params.append('subjectIds', id));
        }

        if (search) params.set('q', search);

        const queryString = params.toString();
        return queryString ? `${base}?${queryString}` : base;
    }, [selectedSubject, enabledSubjectIds, search]);

    const { data: precData, isValidating: isValidatingPrecedents, error: precError, mutate: mutatePrecedents } = useSWR(precUrl, fetcher, {
        keepPreviousData: false,
        revalidateOnFocus: true,
    });

    const loading = !precData && !precError;
    const precedents: Precedent[] = precData?.precedents ?? [];

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
        setRevealed({});
        setFlashcardResults({});
        setShowHints({});
    }, [precData]);

    const markRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const prev = readMap[id] || { count: 0, events: [], isFavorite: false, notes: null, correct: 0, wrong: 0, last: null };
        setReadMap(m => ({ ...m, [id]: { ...prev, count: prev.count + 1, events: [new Date().toISOString(), ...prev.events] } }));
        await fetch('/api/user/read', { method: 'POST', body: JSON.stringify({ precedentId: id, action: 'READ' }) });
        mutateSubjects();
    };

    const decrementRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const prev = readMap[id];
        if (!prev || prev.count <= 0) return;
        setReadMap(m => ({ ...m, [id]: { ...prev, count: prev.count - 1, events: prev.events.slice(1) } }));
        await fetch('/api/user/read', { method: 'POST', body: JSON.stringify({ precedentId: id, action: 'DECREMENT' }) });
        mutateSubjects();
    };

    const resetRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Zerar todas as leituras deste julgado?')) return;
        setReadMap(m => ({ ...m, [id]: { ...m[id], count: 0, events: [] } }));
        await fetch('/api/user/read', { method: 'POST', body: JSON.stringify({ precedentId: id, action: 'RESET' }) });
        mutateSubjects();
    };

    const toggleFavorite = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const prev = readMap[id] || { isFavorite: false };
        setReadMap(m => ({ ...m, [id]: { ...m[id], isFavorite: !prev.isFavorite } }));
        await fetch('/api/user/read', { method: 'POST', body: JSON.stringify({ precedentId: id, action: 'FAVORITE' }) });
    };

    const handleFlashcard = async (p: Precedent, userChoice: boolean) => {
        const isCorrect = p.flashcardAnswer === userChoice;
        setRevealed(prev => ({ ...prev, [p.id]: true }));
        setFlashcardResults(prev => ({ ...prev, [p.id]: isCorrect ? 'CORRECT' : 'WRONG' }));
        const current = readMap[p.id] || { correct: 0, wrong: 0 };
        setReadMap(m => ({
            ...m,
            [p.id]: {
                ...m[p.id],
                correct: isCorrect ? current.correct + 1 : current.correct,
                wrong: !isCorrect ? current.wrong + 1 : current.wrong,
                last: isCorrect ? 'HIT' : 'MISS'
            }
        }));
        await fetch('/api/user/read', { method: 'POST', body: JSON.stringify({ precedentId: p.id, action: isCorrect ? 'HIT' : 'MISS' }) });
        mutateSubjects();
    };

    const saveNotes = async (id: string, notes: string | null) => {
        setReadMap(m => ({ ...m, [id]: { ...m[id], notes } }));
        await fetch('/api/user/read', { method: 'POST', body: JSON.stringify({ precedentId: id, action: 'NOTES', notes }) });
        setNotesModal(null);
    };

    const copyToClipboard = (text: string, id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopying(id);
        setTimeout(() => setCopying(null), 2000);
    };

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
    }, [precedents, readMap, filterHideRead, filterOnlyErrors, filterOnlyFavorites, courtFilter, yearFilter, infFilter]);

    const availableInformatories = useMemo(() => {
        const set = new Set<string>();
        precedents.forEach(p => { if (p.informatoryNumber) set.add(p.informatoryNumber); });
        return Array.from(set).sort((a, b) => b.localeCompare(a));
    }, [precedents]);

    const groupedPrecedents = useMemo(() => {
        if (selectedSubject !== 'ALL') return null;
        const groups: Record<string, Precedent[]> = {};
        filtered.forEach(p => {
            const subName = p.subjects?.[0]?.name || 'Outros';
            if (!groups[subName]) groups[subName] = [];
            groups[subName].push(p);
        });
        return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
    }, [filtered, selectedSubject]);

    if (!isInitialized) return null;

    return (
        <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans ${isFocusMode ? 'focus-mode-active' : ''}`} style={{ fontSize: `${fontSize}px` }}>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
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
                    userName={userName}
                    hasSelection={subData?.hasSelection}
                    currentSubjectName={selectedSubject === 'ALL' ? 'Todas as Habilitadas' : allSubjects.find(s => s.id === selectedSubject)?.name || 'Carregando...'}
                    subjects={allSubjects}
                    selectedSubject={selectedSubject}
                    onSelectSubject={setSelectedSubject}
                    enabledSubjectIds={enabledSubjectIds}
                    setEnabledSubjectIds={setEnabledSubjectIds}
                />

                <DashboardFilters
                    isFocusMode={isFocusMode}
                    selectedSubject={selectedSubject}
                    setSelectedSubject={setSelectedSubject}
                    subjects={enabledSubjects}
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
                    loadingSubjects={!subData && !allSubjects.length}
                />

                <PrecedentList
                    isFocusMode={isFocusMode}
                    loading={loading}
                    error={precError || (precData?.error ? { message: precData.details || precData.error } : null)}
                    groupedPrecedents={groupedPrecedents}
                    filtered={filtered}
                    subjects={allSubjects}
                    selectedSubject={selectedSubject}
                    onSelectSubject={setSelectedSubject}
                    onResetFilters={() => {
                        setSelectedSubject('ALL');
                        setSearch('');
                        setCourtFilter('ALL');
                        setYearFilter('ALL');
                        setInfFilter('ALL');
                        setFilterHideRead(false);
                        setFilterOnlyFavorites(false);
                        setFilterOnlyErrors(false);
                    }}
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

                <FocusModeOverlay
                    isFocusMode={isFocusMode}
                    setIsFocusMode={setIsFocusMode}
                    compactMode={compactMode}
                    setCompactMode={setCompactMode}
                    setFontSize={setFontSize}
                    fontSize={fontSize}
                />

                <HelpModal
                    isOpen={showHelp}
                    onClose={() => setShowHelp(false)}
                    step={helpStep}
                    setStep={setHelpStep}
                />

                {selectedPrecedent && (
                    <PrecedentDetailsModal
                        p={selectedPrecedent}
                        onClose={() => setSelectedPrecedent(null)}
                        readData={readMap[selectedPrecedent.id]}
                    />
                )}

                {historyModal && (
                    <HistoryModal
                        events={historyModal.events}
                        onClose={() => setHistoryModal(null)}
                    />
                )}

                {notesModal && (
                    <NotesModal
                        initialNotes={notesModal.notes}
                        onClose={() => setNotesModal(null)}
                        onSave={(notes) => saveNotes(notesModal.id, notes)}
                    />
                )}
            </main>

            <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
                <p>Juris Concursos &copy; {new Date().getFullYear()} • Versão {APP_VERSION}</p>
            </footer>

            <style jsx global>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .dark-theme .skeleton-box { background: #1e293b; }
                .skeleton-box { background: #f1f5f9; position: relative; overflow: hidden; }
                .skeleton-box::after { content: ""; position: absolute; top: 0; right: 0; bottom: 0; left: 0; transform: translateX(-100%); background-image: linear-gradient(90deg, rgba(255, 255, 255, 0) 0, rgba(255, 255, 255, 0.2) 20%, rgba(255, 255, 255, 0.5) 60%, rgba(255, 255, 255, 0)); animation: shimmer 2s infinite; }
                @keyframes shimmer { 100% { transform: translateX(100%); } }
            `}</style>
        </div>
    );
}
