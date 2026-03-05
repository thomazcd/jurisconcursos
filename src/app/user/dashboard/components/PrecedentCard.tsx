import React from 'react';
import { Icons as SvgIcons } from '@/components/ui/Icons';
import { Precedent } from '../types';

interface PrecedentCardProps {
    p: Precedent;
    readData: { count: number, events: string[], correct: number, wrong: number, last: string | null, isFavorite: boolean, notes: string | null };
    isRevealed: boolean;
    studyMode: 'READ' | 'FLASHCARD';
    compactMode: boolean;
    currentSubjectContext?: string;
    flashResult?: 'CORRECT' | 'WRONG' | null;
    showHint: boolean;
    copyingId: string | null;

    onMarkRead: (id: string, e: React.MouseEvent) => void;
    onDecrementRead: (id: string, e: React.MouseEvent) => void;
    onResetRead: (id: string, e: React.MouseEvent) => void;
    onHandleFlashcard: (p: Precedent, userChoice: boolean) => void;
    onToggleFavorite: (id: string, e: React.MouseEvent) => void;
    onShowNotes: (id: string, notes: string | null, e: React.MouseEvent) => void;
    onShowHistory: (id: string, events: string[], e: React.MouseEvent) => void;
    onSelectPrecedent: (p: Precedent, e: React.MouseEvent) => void;
    onCopyNumber: (text: string, id: string, e: React.MouseEvent) => void;
    onShowHint: (id: string, e: React.MouseEvent) => void;
}

export const PrecedentCard: React.FC<PrecedentCardProps> = ({
    p, readData, isRevealed, studyMode, compactMode, currentSubjectContext, flashResult, showHint, copyingId,
    onMarkRead, onDecrementRead, onResetRead, onHandleFlashcard, onToggleFavorite, onShowNotes, onShowHistory, onSelectPrecedent, onCopyNumber, onShowHint
}) => {
    const isRead = readData.count > 0;
    const firstProcNumber = p.processNumber ? p.processNumber.split(',')[0].trim() : '';
    const procList = [p.processClass, firstProcNumber].filter(Boolean).join(' ');

    return (
        <div
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
            onClick={(e) => {
                if (!isRead) onMarkRead(p.id, e);
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
                <div style={{ background: 'var(--surface2)', padding: '1.5rem', borderRadius: 16, border: '2px solid rgba(139, 92, 246, 0.3)', marginBottom: '1rem', boxShadow: '0 8px 24px rgba(139, 92, 246, 0.05)', position: 'relative', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #8b5cf6, #ec4899)' }}></div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#8b5cf6', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}><SvgIcons.Brain size={14} /> Julgue o Item</div>
                    <div style={{ fontSize: '1.1em', color: 'var(--text)', fontWeight: 700, marginBottom: '1.5rem', lineHeight: '1.6' }}>{p.flashcardQuestion || p.summary}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <button onClick={(e) => { e.stopPropagation(); onHandleFlashcard(p, true); }} className="btn" style={{ background: '#10b981', color: '#fff', fontWeight: 900, fontSize: '0.95rem', height: '44px', borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}><SvgIcons.Check size={18} /> CERTO</button>
                        <button onClick={(e) => { e.stopPropagation(); onHandleFlashcard(p, false); }} className="btn" style={{ background: '#ef4444', color: '#fff', fontWeight: 900, fontSize: '0.95rem', height: '44px', borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}><SvgIcons.X size={18} /> ERRADO</button>
                    </div>
                </div>
            ) : (
                <div style={{ marginBottom: compactMode ? '0.5rem' : '1rem' }}>
                    {flashResult && (
                        <div style={{
                            padding: '0.75rem 1rem',
                            marginBottom: '1rem',
                            borderRadius: 12,
                            background: flashResult === 'CORRECT' ? '#dcfce7' : '#fee2e2',
                            color: flashResult === 'CORRECT' ? '#166534' : '#991b1b',
                            fontWeight: 900,
                            fontSize: '0.9rem',
                            border: `2px solid ${flashResult === 'CORRECT' ? '#86efac' : '#fca5a5'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: `0 4px 12px ${flashResult === 'CORRECT' ? 'rgba(22, 101, 52, 0.1)' : 'rgba(153, 27, 27, 0.1)'}`,
                            animation: 'fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}>
                            {flashResult === 'CORRECT' ? <><SvgIcons.CheckCircle size={20} /> VOCÊ ACERTOU! MANDOU BEM!</> : <><SvgIcons.AlertCircle size={20} /> VOCÊ ERROU! ATENÇÃO NA REVISÃO.</>}
                        </div>
                    )}

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
                        <button
                            onClick={(e) => onToggleFavorite(p.id, e)}
                            style={{
                                border: 'none', background: 'var(--surface2)', cursor: 'pointer', fontSize: '1rem',
                                color: readData.isFavorite ? '#f59e0b' : 'var(--text-4)', transition: 'all 0.2s', padding: '4px',
                                borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = 'var(--border)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = 'var(--surface2)'; }}
                            title={readData.isFavorite ? 'Remover Favorito' : 'Adicionar aos Favoritos'}
                        >
                            {readData.isFavorite ? <SvgIcons.Star size={16} fill="#f59e0b" color="#f59e0b" /> : <SvgIcons.Star size={16} />}
                        </button>
                        <button
                            onClick={(e) => onShowNotes(p.id, readData.notes, e)}
                            style={{
                                border: 'none', background: 'var(--surface2)', cursor: 'pointer', fontSize: '1rem',
                                color: readData.notes ? 'var(--accent)' : 'var(--text-4)', transition: 'all 0.2s', padding: '4px',
                                borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', position: 'relative'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = 'var(--border)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = 'var(--surface2)'; }}
                            title={readData.notes ? 'Ver/Editar Anotação' : 'Adicionar Anotação'}
                        >
                            <SvgIcons.MessageSquare size={16} />
                            {readData.notes && <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%', border: '2px solid var(--surface1)' }} />}
                        </button>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-3)', padding: '2px 0', whiteSpace: 'nowrap', fontSize: '0.7rem' }}>
                            <SvgIcons.Landmark size={11} /> {p.court} {p.informatoryNumber}{p.informatoryYear ? `/${p.informatoryYear}` : ''}
                        </span>

                        <span style={{ padding: '2px 0', color: 'var(--text-3)', fontSize: '0.7rem' }}>
                            <SvgIcons.Search size={11} /> {procList}
                        </span>

                        <span
                            onClick={(e) => onSelectPrecedent(p, e)}
                            style={{
                                cursor: 'pointer',
                                padding: '2px 8px',
                                color: 'var(--accent)',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                background: 'rgba(20, 184, 166, 0.08)',
                                borderRadius: '4px',
                                transition: 'all 0.2s',
                                border: '1px solid rgba(20, 184, 166, 0.15)'
                            }}
                            title="Clique para ver detalhes e inteiro teor"
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(20, 184, 166, 0.15)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(20, 184, 166, 0.08)';
                                e.currentTarget.style.transform = 'none';
                            }}
                        >
                            Inteiro teor
                        </span>

                        {p.organ && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-3)', padding: '2px 0', whiteSpace: 'nowrap', fontSize: '0.7rem', fontWeight: 800 }}><SvgIcons.Gavel size={11} /> {p.organ}</span>}

                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-3)', padding: '2px 0', whiteSpace: 'nowrap', fontSize: '0.7rem' }}>
                            <SvgIcons.User size={11} />
                            {p.rapporteur?.includes('Rel. p/ acórdão') ? p.rapporteur.split(',').find(s => s.includes('Rel. p/ acórdão'))?.trim() : (p.rapporteur || '---')}
                        </span>

                        {p.judgmentDate && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}><SvgIcons.Calendar size={11} /> Jul: {new Date(p.judgmentDate).toLocaleDateString('pt-BR')}</span>}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: !p.publicationDate ? 'help' : 'default', fontSize: '0.7rem' }} title={!p.publicationDate ? "Na publicação do informativo não foi informada data de publicação do julgado." : undefined}>
                            <SvgIcons.FileText size={11} /> Publ: {p.publicationDate ? new Date(p.publicationDate).toLocaleDateString('pt-BR') : '--'}
                        </span>
                        {(readData.correct > 0 || readData.wrong > 0) && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-3)', opacity: 0.8, background: 'var(--surface2)', padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem' }}><SvgIcons.Chart size={11} /> {readData.correct}V | {readData.wrong}F</span>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }} onClick={e => e.stopPropagation()}>
                        {isRead && (
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                <button onClick={(e) => onMarkRead(p.id, e)} className="btn-activity btn-activity-inc no-print" title="Lido mais uma vez">+1</button>
                                <button onClick={(e) => onDecrementRead(p.id, e)} className="btn-activity btn-activity-dec no-print" title="Diminuir uma leitura">-1</button>
                                <div
                                    style={{ marginLeft: '4px', background: 'var(--surface2)', padding: '4px 10px', borderRadius: 8, fontWeight: 800, color: 'var(--text-2)', cursor: 'pointer', fontSize: '0.75rem' }}
                                    onClick={(e) => onShowHistory(p.id, readData.events || [], e)}
                                    title="Clique para ver o histórico de leituras"
                                >
                                    {readData.count}×
                                </div>
                                <button
                                    onClick={(e) => onResetRead(p.id, e)}
                                    className="no-print"
                                    style={{
                                        border: '1px solid var(--border)',
                                        background: 'var(--surface2)',
                                        padding: '4px 8px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: 'var(--text-4)',
                                        fontSize: '0.65rem',
                                        fontWeight: 800,
                                        transition: 'all 0.2s',
                                        whiteSpace: 'nowrap'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-4)'; }}
                                    title="Zerar todas as leituras"
                                >
                                    Marcar não lido
                                </button>
                            </div>
                        )}
                        {!isRead && (
                            <button
                                className="btn no-print"
                                style={{
                                    padding: '4px 12px', fontWeight: 800, borderRadius: 8, fontSize: '0.75rem', background: 'var(--surface2)',
                                    border: '1px solid var(--border)', color: 'var(--text-3)', transition: 'all 0.2s'
                                }}
                                onClick={(e) => onMarkRead(p.id, e)}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)'; }}
                            >
                                Marcar Lido
                            </button>
                        )}
                    </div>
                    {studyMode === 'FLASHCARD' && !isRevealed && (
                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--surface2)', borderRadius: 12, border: '1px dashed var(--border-strong)', textAlign: 'center' }}>
                            {!showHint ? (
                                <button
                                    onClick={(e) => onShowHint(p.id, e)}
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
