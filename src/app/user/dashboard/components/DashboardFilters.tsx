import React from 'react';
import { Icons as SvgIcons } from '@/components/ui/Icons';
import { Subject } from '../types';

interface DashboardFiltersProps {
    isFocusMode: boolean;
    selectedSubject: string;
    setSelectedSubject: (val: string) => void;
    subjects: Subject[]; // Estas devem ser as habilitadas
    search: string;
    setSearch: (val: string) => void;
    courtFilter: 'ALL' | 'STF' | 'STJ';
    setCourtFilter: (val: 'ALL' | 'STF' | 'STJ') => void;
    filteredCount: number;
    availableInformatories: string[];
    infFilter: string;
    setInfFilter: (val: string) => void;
    filterOnlyFavorites: boolean;
    setFilterOnlyFavorites: (val: boolean) => void;
    filterHideRead: boolean;
    setFilterHideRead: (val: boolean) => void;
    filterOnlyErrors: boolean;
    setFilterOnlyErrors: (val: boolean) => void;
    loadingSubjects?: boolean;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = (props) => {
    const {
        isFocusMode, selectedSubject, setSelectedSubject, subjects,
        search, setSearch, courtFilter, setCourtFilter, filteredCount,
        availableInformatories, infFilter, setInfFilter,
        filterOnlyFavorites, setFilterOnlyFavorites,
        filterHideRead, setFilterHideRead,
        filterOnlyErrors, setFilterOnlyErrors,
        loadingSubjects
    } = props;

    // Se o modo foco estiver ativo, não mostramos os filtros
    if (isFocusMode) return null;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginBottom: '2rem',
            padding: '1.5rem',
            background: 'var(--surface)',
            borderRadius: '24px',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            animation: 'fadeIn 0.3s ease-out'
        }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Seletor de Matéria (Filtrado pelo Escopo) */}
                <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', zIndex: 1, pointerEvents: 'none' }}>
                        <SvgIcons.Subjects size={16} />
                    </div>
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        disabled={loadingSubjects}
                        style={{
                            width: '100%',
                            padding: '14px 14px 14px 40px',
                            background: 'var(--surface2)',
                            borderRadius: '16px',
                            border: '1px solid var(--border)',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            color: 'var(--text)',
                            cursor: 'pointer',
                            appearance: 'none',
                            outline: 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        <option value="ALL">Visualizar: Todas as Habilitadas</option>
                        {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.total})</option>
                        ))}
                    </select>
                </div>

                {/* Busca Local */}
                <div style={{ flex: 1.5, minWidth: '280px', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)', zIndex: 1 }}>
                        <SvgIcons.Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar julgado ou tema..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '14px 14px 14px 44px',
                            background: 'var(--surface2)',
                            borderRadius: '16px',
                            border: '1px solid var(--border)',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: 'var(--text)',
                            outline: 'none',
                            transition: 'all 0.2s'
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(20, 184, 166, 0.1)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                </div>

                {/* Tribunal */}
                <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: '14px', border: '1px solid var(--border)', padding: '4px', gap: '4px' }}>
                    {(['ALL', 'STF', 'STJ'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setCourtFilter(t)}
                            style={{
                                padding: '10px 18px',
                                borderRadius: '10px',
                                border: 'none',
                                background: courtFilter === t ? 'var(--accent)' : 'transparent',
                                color: courtFilter === t ? '#fff' : 'var(--text-3)',
                                fontSize: '0.75rem',
                                fontWeight: 900,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >{t === 'ALL' ? 'STF & STJ' : t}</button>
                    ))}
                </div>

                {/* Informativo */}
                <select
                    value={infFilter}
                    onChange={(e) => setInfFilter(e.target.value)}
                    style={{
                        padding: '12px 16px',
                        background: 'var(--surface2)',
                        borderRadius: '14px',
                        border: '1px solid var(--border)',
                        fontSize: '0.85rem',
                        fontWeight: 750,
                        color: 'var(--text)',
                        cursor: 'pointer',
                        minWidth: '150px'
                    }}
                >
                    <option value="ALL">Todo Período</option>
                    {availableInformatories.map(inf => (
                        <option key={inf} value={inf}>Informativo nº {inf}</option>
                    ))}
                </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-soft, rgba(0,0,0,0.03))' }}>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <FilterToggle active={filterOnlyFavorites} onClick={() => setFilterOnlyFavorites(!filterOnlyFavorites)} icon={<SvgIcons.Star size={14} />} label="Favoritos" />
                    <FilterToggle active={filterHideRead} onClick={() => setFilterHideRead(!filterHideRead)} icon={<SvgIcons.CheckCircle size={14} />} label="Não Lidos" />
                    <FilterToggle active={filterOnlyErrors} onClick={() => setFilterOnlyErrors(!filterOnlyErrors)} icon={<SvgIcons.X size={14} />} label="Com Erros" />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-4)', background: 'var(--surface2)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--accent)' }}>{filteredCount}</span> JULGADOS ENCONTRADOS
                    </span>
                    <button
                        onClick={() => {
                            setSelectedSubject('ALL');
                            setSearch('');
                            setCourtFilter('ALL');
                            setInfFilter('ALL');
                            setFilterHideRead(false);
                            setFilterOnlyFavorites(false);
                            setFilterOnlyErrors(false);
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                    >Limpar tudo</button>
                </div>
            </div>
        </div>
    );
};

const FilterToggle = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '12px',
            border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
            background: active ? 'rgba(20, 184, 166, 0.08)' : 'var(--surface2)',
            color: active ? 'var(--accent)' : 'var(--text-3)',
            fontSize: '0.75rem',
            fontWeight: 850,
            cursor: 'pointer',
            transition: 'all 0.2s'
        }}
    >
        {icon} {label}
    </button>
);
