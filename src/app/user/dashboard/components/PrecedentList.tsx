import React from 'react';
import { Icons as SvgIcons } from '@/components/ui/Icons';
import { PrecedentCard } from './PrecedentCard';
import { Subject, Precedent } from '../types';

interface PrecedentListProps {
    isFocusMode: boolean;
    loading: boolean;
    groupedPrecedents: [string, Precedent[]][] | null;
    filtered: Precedent[];
    subjects: Subject[];
    selectedSubject: string;
    readMap: Record<string, { count: number, events: string[], correct: number, wrong: number, last: string | null, isFavorite: boolean, notes: string | null }>;
    studyMode: 'READ' | 'FLASHCARD';
    revealed: Record<string, boolean>;
    flashcardResults: Record<string, 'CORRECT' | 'WRONG' | null>;
    compactMode: boolean;
    showHints: Record<string, boolean>;
    copyingId: string | null;
    markRead: (id: string, e: React.MouseEvent) => void;
    decrementRead: (id: string, e: React.MouseEvent) => void;
    resetRead: (id: string, e: React.MouseEvent) => void;
    handleFlashcard: (p: Precedent, userChoice: boolean) => void;
    toggleFavorite: (id: string, e: React.MouseEvent) => void;
    setNotesModal: (val: { id: string, notes: string | null } | null) => void;
    setHistoryModal: (val: { id: string, events: string[] } | null) => void;
    setSelectedPrecedent: (val: Precedent | null) => void;
    copyToClipboard: (text: string, id: string, e: React.MouseEvent) => void;
    setShowHints: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export const PrecedentList: React.FC<PrecedentListProps> = ({
    isFocusMode, loading, groupedPrecedents, filtered, subjects, selectedSubject,
    readMap, studyMode, revealed, flashcardResults, compactMode, showHints, copyingId,
    markRead, decrementRead, resetRead, handleFlashcard, toggleFavorite,
    setNotesModal, setHistoryModal, setSelectedPrecedent, copyToClipboard, setShowHints
}) => {
    const renderPrecedent = (p: Precedent, currentSubjectContext?: string) => {
        const readData = readMap[p.id] || { count: 0, events: [], correct: 0, wrong: 0, last: null, isFavorite: false, notes: null };
        const isRevealed = studyMode === 'READ' || revealed[p.id];
        const flashResult = flashcardResults[p.id];

        return (
            <PrecedentCard
                key={`${p.id}-${currentSubjectContext || 'all'}`}
                p={p}
                readData={readData}
                isRevealed={isRevealed}
                studyMode={studyMode}
                compactMode={compactMode}
                currentSubjectContext={currentSubjectContext}
                flashResult={flashResult}
                showHint={showHints[p.id] || false}
                copyingId={copyingId}
                onMarkRead={markRead}
                onDecrementRead={decrementRead}
                onResetRead={resetRead}
                onHandleFlashcard={handleFlashcard}
                onToggleFavorite={toggleFavorite}
                onShowNotes={(id, notes, e) => { e.stopPropagation(); setNotesModal({ id, notes }); }}
                onShowHistory={(id, events, e) => { e.stopPropagation(); setHistoryModal({ id, events }); }}
                onSelectPrecedent={(p, e) => { e.stopPropagation(); setSelectedPrecedent(p); }}
                onCopyNumber={copyToClipboard}
                onShowHint={(id, e) => { e.stopPropagation(); setShowHints(prev => ({ ...prev, [id]: true })); }}
            />
        );
    };

    return (
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
    );
};
