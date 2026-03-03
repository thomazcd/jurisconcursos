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
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
    isFocusMode, selectedSubject, setSelectedSubject, subjects, search, setSearch,
    courtFilter, setCourtFilter, filteredCount, availableInformatories, infFilter, setInfFilter,
    filterOnlyFavorites, setFilterOnlyFavorites, filterHideRead, setFilterHideRead,
    filterOnlyErrors, setFilterOnlyErrors
}) => {
    return (
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
