import React, { useState } from 'react';
import { Icons as SvgIcons } from '@/components/ui/Icons';
import { Subject } from '../types';

interface DashboardHeaderProps {
    isFocusMode: boolean;
    setIsFocusMode: (val: boolean) => void;
    studyMode: 'READ' | 'FLASHCARD';
    setStudyMode: (val: 'READ' | 'FLASHCARD') => void;
    compactMode: boolean;
    setCompactMode: (val: boolean | ((prev: boolean) => boolean)) => void;
    setFontSize: (val: number | ((prev: number) => number)) => void;
    toggleTheme: () => void;
    isDark: boolean;
    setShowHelp: (val: boolean) => void;
    userName: string;
    hasSelection?: boolean;
    currentSubjectName: string;
    subjects: Subject[];
    selectedSubject: string;
    onSelectSubject: (val: string) => void;
    enabledSubjectIds: string[];
    setEnabledSubjectIds: (val: string[]) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = (props) => {
    const {
        isFocusMode, setIsFocusMode, studyMode, setStudyMode,
        compactMode, setCompactMode, setFontSize, toggleTheme, isDark, setShowHelp,
        userName, hasSelection, currentSubjectName,
        subjects, selectedSubject, onSelectSubject,
        enabledSubjectIds, setEnabledSubjectIds
    } = props;

    const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);

    const toggleSubjectInScope = (id: string) => {
        if (enabledSubjectIds.includes(id)) {
            setEnabledSubjectIds(enabledSubjectIds.filter(sid => sid !== id));
        } else {
            setEnabledSubjectIds([...enabledSubjectIds, id]);
        }
    };

    const toggleAll = () => {
        if (enabledSubjectIds.length === subjects.length) {
            setEnabledSubjectIds([]);
        } else {
            setEnabledSubjectIds(subjects.map(s => s.id));
        }
    };

    return (
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                <div style={{ position: 'relative' }}>
                    <div
                        onClick={() => setIsScopeModalOpen(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 14px',
                            background: 'rgba(20, 184, 166, 0.12)',
                            border: '1px solid rgba(20, 184, 166, 0.25)',
                            borderRadius: '12px',
                            color: 'var(--accent)',
                            fontSize: '0.85rem',
                            fontWeight: 900,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 8px rgba(20, 184, 166, 0.08)'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.background = 'rgba(20, 184, 166, 0.18)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = 'rgba(20, 184, 166, 0.12)'; }}
                    >
                        <SvgIcons.Settings size={16} /> Habilitar Matérias ({enabledSubjectIds.length}/{subjects.length})
                    </div>

                    {isScopeModalOpen && (
                        <div style={{
                            position: 'fixed',
                            top: 0, left: 0, right: 0, bottom: 0,
                            zIndex: 2000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(0,0,0,0.4)',
                            backdropFilter: 'blur(4px)',
                            padding: '20px'
                        }}
                            onClick={() => setIsScopeModalOpen(false)}
                        >
                            <div
                                style={{
                                    background: 'var(--surface)',
                                    width: '100%',
                                    maxWidth: '500px',
                                    borderRadius: '24px',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    maxHeight: '85vh'
                                }}
                                onClick={e => e.stopPropagation()}
                            >
                                <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>Escopo de Estudo</h3>
                                        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-3)' }}>Selecione as matérias que deseja habilitar no filtro.</p>
                                    </div>
                                    <button onClick={() => setIsScopeModalOpen(false)} style={{ background: 'var(--surface2)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <SvgIcons.X size={16} />
                                    </button>
                                </div>
                                <div style={{ padding: '16px 32px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)', display: 'flex', justifyContent: 'space-between' }}>
                                    <button onClick={toggleAll} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem' }}>
                                        {enabledSubjectIds.length === subjects.length ? 'Desmarcar Todas' : 'Marcar Todas'}
                                    </button>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.6 }}>{enabledSubjectIds.length} selecionadas</span>
                                </div>
                                <div style={{ overflowY: 'auto', padding: '16px 32px', flex: 1 }}>
                                    {subjects.map(s => (
                                        <div
                                            key={s.id}
                                            onClick={() => toggleSubjectInScope(s.id)}
                                            style={{
                                                padding: '12px 16px',
                                                margin: '4px 0',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                background: enabledSubjectIds.includes(s.id) ? 'rgba(20, 184, 166, 0.05)' : 'transparent',
                                                transition: 'all 0.15s'
                                            }}
                                        >
                                            <div style={{
                                                width: 20,
                                                height: 20,
                                                borderRadius: 6,
                                                border: `2px solid ${enabledSubjectIds.includes(s.id) ? 'var(--accent)' : 'var(--border)'}`,
                                                background: enabledSubjectIds.includes(s.id) ? 'var(--accent)' : 'transparent',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#fff'
                                            }}>
                                                {enabledSubjectIds.includes(s.id) && <SvgIcons.Check size={14} />}
                                            </div>
                                            <span style={{ fontSize: '0.9rem', fontWeight: enabledSubjectIds.includes(s.id) ? 700 : 500, flex: 1 }}>{s.name}</span>
                                            <span style={{ fontSize: '0.75rem', opacity: 0.5, fontWeight: 700 }}>{s.readCount}/{s.total}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => setIsScopeModalOpen(false)}
                                        style={{
                                            padding: '12px 32px',
                                            borderRadius: '12px',
                                            background: 'var(--accent)',
                                            color: '#fff',
                                            border: 'none',
                                            fontWeight: 900,
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)'
                                        }}
                                    >Continuar Estudos</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

                {/* Modo de Estudo (Switch Imersivo) */}
                <div style={{ display: 'flex', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '4px', gap: '4px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                    <button
                        onClick={() => setStudyMode('READ')}
                        style={{
                            padding: '8px 24px',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: 900,
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            background: studyMode === 'READ' ? 'var(--accent)' : 'transparent',
                            color: studyMode === 'READ' ? '#fff' : 'var(--text-3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: studyMode === 'READ' ? '0 4px 12px rgba(20, 184, 166, 0.3)' : 'none'
                        }}
                    ><SvgIcons.Book size={16} /> LEITURA LIVRE</button>
                    <button
                        onClick={() => setStudyMode('FLASHCARD')}
                        style={{
                            padding: '8px 24px',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: 900,
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            background: studyMode === 'FLASHCARD' ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : 'transparent',
                            color: studyMode === 'FLASHCARD' ? '#fff' : 'var(--text-3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: studyMode === 'FLASHCARD' ? '0 4px 12px rgba(236, 72, 153, 0.3)' : 'none'
                        }}
                    ><SvgIcons.Brain size={16} /> REVISÃO (V/F)</button>
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
                    {isDark ? <SvgIcons.Sun size={18} /> : <SvgIcons.Moon size={18} />}
                </button>
            </div>
        </div>
    );
};
