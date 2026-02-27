'use client';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type Subject = {
    id: string;
    name: string;
    trackScope: string;
    total: number;
    readCount: number;
    unreadCount: number;
};

type Precedent = {
    id: string;
    court: string;
    title: string;
    summary: string;
    fullTextOrLink?: string | null;
    forAll: boolean;
    forProcurador: boolean;
    forJuizFederal: boolean;
    forJuizEstadual: boolean;
    tags: string[];
    judgmentDate?: string | null;
    isRG: boolean;
    rgTheme?: number | null;
    informatoryNumber?: string | null;
    processClass?: string | null;
    processNumber?: string | null;
    organ?: string | null;
    rapporteur?: string | null;
    createdAt: string;
    isRead: boolean;
    subject?: { name: string };
};

interface DashboardClientProps {
    userName: string;
    track: string;
}

const TRACK_OPTIONS = [
    { value: 'JUIZ_ESTADUAL', icon: '⚖️', label: 'Juiz Estadual', sub: 'Magistratura Estadual' },
    { value: 'JUIZ_FEDERAL', icon: '🏛️', label: 'Juiz Federal', sub: 'Magistratura Federal' },
    { value: 'PROCURADOR', icon: '📋', label: 'Procurador', sub: 'Procuradoria do Estado' },
];

function trackColor(track: string) {
    if (track === 'PROCURADOR') return 'var(--proc-text, #2563eb)';
    if (track === 'JUIZ_FEDERAL') return 'var(--accent, #3a7d44)';
    return 'var(--gold, #b45309)';
}

function trackLabel(track: string) {
    return TRACK_OPTIONS.find((t) => t.value === track)?.label ?? track;
}

function PrecedentRow({ p, onToggle }: { p: Precedent; onToggle: (id: string, read: boolean) => void }) {
    const [toggling, setToggling] = useState(false);
    const [showTip, setShowTip] = useState(false);

    async function toggle() {
        setToggling(true);
        const res = await fetch('/api/user/reads', {
            method: p.isRead ? 'DELETE' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ precedentId: p.id }),
        });
        if (res.ok) onToggle(p.id, !p.isRead);
        setToggling(false);
    }

    const dateStr = p.judgmentDate
        ? new Date(p.judgmentDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : p.createdAt ? new Date(p.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

    const tooltipLines: string[] = [];
    if (p.summary) tooltipLines.push(p.summary);
    if (p.processClass || p.processNumber) tooltipLines.push(`${p.processClass ?? ''} ${p.processNumber ?? ''}`.trim());
    if (p.organ) tooltipLines.push(`Órgão: ${p.organ}`);
    if (p.rapporteur) tooltipLines.push(`Rel: ${p.rapporteur}`);
    if (p.isRG && p.rgTheme) tooltipLines.push(`Tema RG ${p.rgTheme}`);
    if (p.informatoryNumber) tooltipLines.push(`Informativo ${p.informatoryNumber}`);
    if (p.tags.length > 0) tooltipLines.push(`Tags: ${p.tags.join(', ')}`);
    if (p.fullTextOrLink) tooltipLines.push('🔗 Ver inteiro teor');

    return (
        <div
            className={`precedent-row ${p.isRead ? 'read' : 'unread'}`}
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
        >
            <span className="prec-date">{dateStr}</span>
            <span className={`prec-court court-${p.court.toLowerCase()}`}>{p.court}</span>
            {p.isRG && p.rgTheme && <span className="prec-rg">RG {p.rgTheme}</span>}
            <span className="prec-title">{p.title}</span>
            <button
                className={`prec-read-btn ${p.isRead ? 'is-read' : ''}`}
                onClick={toggle}
                disabled={toggling}
                title={p.isRead ? 'Marcar como não lido' : 'Marcar como lido'}
            >
                {p.isRead ? '✓' : '○'}
            </button>

            {showTip && tooltipLines.length > 0 && (
                <div className="prec-tooltip">
                    <div className="prec-tooltip-title">{p.title}</div>
                    {p.summary && <div className="prec-tooltip-summary">{p.summary.substring(0, 280)}{p.summary.length > 280 ? '…' : ''}</div>}
                    <div className="prec-tooltip-meta">
                        {p.processClass && <span>{p.processClass} {p.processNumber}</span>}
                        {p.organ && <span>· {p.organ}</span>}
                        {p.rapporteur && <span>· {p.rapporteur}</span>}
                        {p.isRG && p.rgTheme && <span>· Tema RG {p.rgTheme}</span>}
                        {p.informatoryNumber && <span>· Informativo {p.informatoryNumber}</span>}
                    </div>
                    {p.tags.length > 0 && (
                        <div className="prec-tooltip-tags">{p.tags.map((t) => <span key={t} className="tag-chip">{t}</span>)}</div>
                    )}
                    {p.fullTextOrLink && (
                        <a href={p.fullTextOrLink} target="_blank" rel="noopener noreferrer" className="prec-tooltip-link">🔗 Ver inteiro teor →</a>
                    )}
                </div>
            )}
        </div>
    );
}

export default function DashboardClient({ userName, track: initialTrack }: DashboardClientProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tab = searchParams.get('tab') ?? 'subjects';

    const [track, setTrack] = useState(initialTrack);
    const [switchingTrack, setSwitchingTrack] = useState(false);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [precedents, setPrecedents] = useState<Precedent[]>([]);
    const [news, setNews] = useState<Precedent[]>([]);
    const [loadingPrecedents, setLoadingPrecedents] = useState(false);
    const [q, setQ] = useState('');
    const [courtFilter, setCourtFilter] = useState('');
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 50;

    const fetchSubjects = useCallback(async () => {
        setLoading(true);
        const res = await fetch('/api/user/subjects');
        const data = await res.json();
        setSubjects(data.subjects ?? []);
        setTrack(data.track ?? initialTrack);
        setLoading(false);
    }, [initialTrack]);

    const fetchPrecedents = useCallback(async (subjectId: string | null, court: string, query: string, pg: number) => {
        setLoadingPrecedents(true);
        const params = new URLSearchParams({ page: String(pg), limit: String(limit) });
        if (subjectId) params.set('subjectId', subjectId);
        if (court) params.set('court', court);
        if (query) params.set('q', query);
        const res = await fetch(`/api/user/precedents?${params}`);
        const data = await res.json();
        setPrecedents(data.precedents ?? []);
        setTotal(data.total ?? 0);
        setLoadingPrecedents(false);
    }, []);

    const fetchNews = useCallback(async () => {
        const res = await fetch('/api/user/news');
        const data = await res.json();
        setNews(data.precedents ?? []);
    }, []);

    useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

    useEffect(() => {
        if (tab === 'precedents') fetchPrecedents(selectedSubject, courtFilter, q, page);
        if (tab === 'news') fetchNews();
    }, [tab, selectedSubject, courtFilter, page, fetchPrecedents, fetchNews]);

    async function switchTrack(newTrack: string) {
        if (newTrack === track || switchingTrack) return;
        setSwitchingTrack(true);
        await fetch('/api/user/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activeTrack: newTrack }),
        });
        setSwitchingTrack(false);
        setSelectedSubject(null);
        setPrecedents([]);
        fetchSubjects();
        router.replace('/user/dashboard');
    }

    function openSubject(id: string) {
        setSelectedSubject(id);
        setPage(1);
        setQ('');
        setCourtFilter('');
        fetchPrecedents(id, '', '', 1);
        router.replace('/user/dashboard?tab=precedents');
    }

    function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
        setQ(e.target.value);
        setPage(1);
        fetchPrecedents(selectedSubject, courtFilter, e.target.value, 1);
    }

    function handleCourtFilter(e: React.ChangeEvent<HTMLSelectElement>) {
        setCourtFilter(e.target.value);
        setPage(1);
        fetchPrecedents(selectedSubject, e.target.value, q, 1);
    }

    function toggleRead(id: string, read: boolean) {
        setPrecedents((prev) => prev.map((x) => x.id === id ? { ...x, isRead: read } : x));
        fetchSubjects();
    }

    const totalUnread = subjects.reduce((acc, s) => acc + s.unreadCount, 0);
    const totalPrecedents = subjects.reduce((acc, s) => acc + s.total, 0);
    const totalRead = subjects.reduce((acc, s) => acc + s.readCount, 0);
    const totalPages = Math.ceil(total / limit);
    const subjectName = subjects.find((s) => s.id === selectedSubject)?.name;

    return (
        <div>
            {/* Track Switcher */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Olá, {userName.split(' ')[0]} 👋</div>
                        <div style={{ fontSize: '0.83rem', color: 'var(--text-3)', marginTop: '0.2rem' }}>
                            Trilha ativa: <strong style={{ color: trackColor(track) }}>{trackLabel(track)}</strong>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {TRACK_OPTIONS.map((t) => (
                            <button
                                key={t.value}
                                onClick={() => switchTrack(t.value)}
                                disabled={switchingTrack}
                                style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    padding: '0.5rem 0.9rem', borderRadius: '10px', cursor: 'pointer',
                                    border: '2px solid', fontSize: '0.78rem', minWidth: '90px',
                                    transition: 'all 0.2s',
                                    borderColor: track === t.value ? 'var(--accent)' : 'var(--border)',
                                    background: track === t.value ? 'var(--accent)' : 'var(--surface)',
                                    color: track === t.value ? '#fff' : 'var(--text)',
                                    fontWeight: track === t.value ? 700 : 400,
                                }}
                            >
                                <span style={{ fontSize: '1.1rem' }}>{t.icon}</span>
                                <strong>{t.label}</strong>
                                <span style={{ opacity: 0.75, fontSize: '0.7rem' }}>{t.sub}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-card"><div className="stat-number stat-accent">{totalPrecedents}</div><div className="stat-label">Disponíveis</div></div>
                <div className="stat-card"><div className="stat-number stat-rose">{totalUnread}</div><div className="stat-label">Não lidos</div></div>
                <div className="stat-card"><div className="stat-number stat-emerald">{totalRead}</div><div className="stat-label">Lidos</div></div>
                <div className="stat-card"><div className="stat-number stat-gold">{subjects.length}</div><div className="stat-label">Matérias</div></div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab ${tab === 'subjects' ? 'active' : ''}`} onClick={() => router.replace('/user/dashboard?tab=subjects')}>📚 Matérias</button>
                <button className={`tab ${tab === 'precedents' ? 'active' : ''}`} onClick={() => { router.replace('/user/dashboard?tab=precedents'); fetchPrecedents(selectedSubject, courtFilter, q, 1); }}>
                    ⚖️ Precedentes{selectedSubject && subjectName ? ` – ${subjectName}` : ''}
                </button>
                <button className={`tab ${tab === 'news' ? 'active' : ''}`} onClick={() => router.replace('/user/dashboard?tab=news')}>
                    🔔 Novidades {news.length > 0 && <span className="badge badge-new" style={{ marginLeft: '4px' }}>{news.length}</span>}
                </button>
            </div>

            {/* Tab: Subjects */}
            {tab === 'subjects' && (
                <div className="subject-grid">
                    {loading && Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: '90px', borderRadius: '12px' }} />)}
                    {!loading && subjects.map((s) => (
                        <button key={s.id} className="subject-card" onClick={() => openSubject(s.id)} style={{ textAlign: 'left', border: 'none', cursor: 'pointer', background: 'var(--surface)' }}>
                            <h3>{s.name}</h3>
                            <div className="unread-count">
                                {s.unreadCount > 0 && <span className="unread-dot" />}
                                <span>{s.unreadCount > 0 ? `${s.unreadCount} não lido(s)` : `${s.total} precedente(s)`} · {s.readCount}/{s.total} lido(s)</span>
                            </div>
                        </button>
                    ))}
                    {!loading && subjects.length === 0 && (
                        <div className="empty-state"><div className="icon">📭</div><p>Nenhuma matéria para esta trilha.</p></div>
                    )}
                </div>
            )}

            {/* Tab: Precedents – lista ultra compacta */}
            {tab === 'precedents' && (
                <div>
                    <div className="filters-bar">
                        <input type="text" placeholder="🔍 Buscar…" value={q} onChange={handleSearch} style={{ flex: 1 }} />
                        <select value={courtFilter} onChange={handleCourtFilter}>
                            <option value="">Todos tribunais</option>
                            <option value="STF">STF</option>
                            <option value="STJ">STJ</option>
                            <option value="TRF">TRF</option>
                            <option value="TJ">TJ</option>
                        </select>
                        <select value={selectedSubject ?? ''} onChange={(e) => { setSelectedSubject(e.target.value || null); setPage(1); fetchPrecedents(e.target.value || null, courtFilter, q, 1); }}>
                            <option value="">Todas as matérias</option>
                            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="prec-list">
                        {loadingPrecedents && Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: '36px', borderRadius: '6px', marginBottom: '2px' }} />)}
                        {!loadingPrecedents && precedents.map((p) => (
                            <PrecedentRow key={p.id} p={p} onToggle={toggleRead} />
                        ))}
                        {!loadingPrecedents && precedents.length === 0 && (
                            <div className="empty-state"><div className="icon">🔍</div><p>Nenhum precedente encontrado.</p></div>
                        )}
                    </div>
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button className="page-btn" disabled={page <= 1} onClick={() => { setPage(page - 1); fetchPrecedents(selectedSubject, courtFilter, q, page - 1); }}>← Anterior</button>
                            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                const pg = i + 1;
                                return <button key={pg} className={`page-btn ${page === pg ? 'active' : ''}`} onClick={() => { setPage(pg); fetchPrecedents(selectedSubject, courtFilter, q, pg); }}>{pg}</button>;
                            })}
                            <button className="page-btn" disabled={page >= totalPages} onClick={() => { setPage(page + 1); fetchPrecedents(selectedSubject, courtFilter, q, page + 1); }}>Próxima →</button>
                        </div>
                    )}
                </div>
            )}

            {/* Tab: News */}
            {tab === 'news' && (
                <div>
                    <div style={{ marginBottom: '0.75rem', color: 'var(--text-3)', fontSize: '0.875rem' }}>
                        {news.length} precedente(s) recente(s) ainda não lidos na sua trilha.
                    </div>
                    <div className="prec-list">
                        {news.map((p) => (
                            <PrecedentRow key={p.id} p={p} onToggle={(id, read) => { setNews((prev) => prev.map((x) => x.id === id ? { ...x, isRead: read } : x)); fetchSubjects(); }} />
                        ))}
                        {news.length === 0 && <div className="empty-state"><div className="icon">🎉</div><p>Em dia com todas as novidades!</p></div>}
                    </div>
                </div>
            )}
        </div>
    );
}
