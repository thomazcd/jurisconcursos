import React from 'react';
import { Icons as SvgIcons } from '@/components/ui/Icons';
import { Subject } from '../types';

interface DashboardFiltersProps {
    isFocusMode: boolean;
    selectedSubject: string;
    setSelectedSubject: (val: string) => void;
    subjects: Subject[];
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
    loadingSubjects: boolean;
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
    isFocusMode, selectedSubject, setSelectedSubject, subjects, search, setSearch,
    courtFilter, setCourtFilter, filteredCount, availableInformatories, infFilter, setInfFilter,
    filterOnlyFavorites, setFilterOnlyFavorites, filterHideRead, setFilterHideRead,
    filterOnlyErrors, setFilterOnlyErrors,
    loadingSubjects, isOpen, setIsOpen
}) => {
    return (
        <div className={`no-print ${isFocusMode ? 'hidden-focus' : ''}`} style={{ background: 'var(--surface)', padding: '1rem', borderRadius: 16, marginBottom: '1rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ flex: '0 0 240px', position: 'relative' }}>
                    <div
                        onClick={() => setIsOpen(!isOpen)}
                        style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                        {loadingSubjects ? 'Carregando matérias...' : (selectedSubject === 'ALL' ? 'Todas do Banco' : subjects.find(s => s.id === selectedSubject)?.name || 'Matéria Selecionada')}
                        <SvgIcons.ChevronDown size={14} />
                    </div>

                    {isOpen && !loadingSubjects && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, zIndex: 100, maxHeight: '300px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            <div
                                onClick={() => { setSelectedSubject('ALL'); setIsOpen(false); }}
                                style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.85rem', background: selectedSubject === 'ALL' ? 'var(--surface2)' : 'transparent', fontWeight: selectedSubject === 'ALL' ? 700 : 500 }}
                            >
                                Todas do Banco
                            </div>
                            {subjects.map(s => (
                                <div
                                    key={s.id}
                                    onClick={() => { setSelectedSubject(s.id); setIsOpen(false); }}
                                    style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.85rem', background: selectedSubject === s.id ? 'var(--surface2)' : 'transparent', fontWeight: selectedSubject === s.id ? 700 : 500, borderTop: '1px solid var(--border)' }}
                                >
                                    {s.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
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
                        {filteredCount} {filteredCount === 1 ? 'julgado encontrado' : 'julgados encontrados'}
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
    );
};
