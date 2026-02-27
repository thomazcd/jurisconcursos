'use client';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PrecedentCard } from '@/components/user/PrecedentCard';

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
    applicability: string;
    tags: string[];
    createdAt: string;
    isRead: boolean;
    subject?: { name: string };
};

interface DashboardClientProps {
    userName: string;
    track: string;
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
    const limit = 15;

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
        if (tab === 'precedents') {
            fetchPrecedents(selectedSubject, courtFilter, q, page);
        }
        if (tab === 'news') {
            fetchNews();
        }
    }, [tab, selectedSubject, courtFilter, page, fetchPrecedents, fetchNews]);

    async function switchTrack(newTrack: string) {
        if (newTrack === track) return;
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

    const totalUnread = subjects.reduce((acc, s) => acc + s.unreadCount, 0);
    const totalPrecedents = subjects.reduce((acc, s) => acc + s.total, 0);
    const totalRead = subjects.reduce((acc, s) => acc + s.readCount, 0);

    const totalPages = Math.ceil(total / limit);

    const subjectName = subjects.find((s) => s.id === selectedSubject)?.name;

    return (
        <div>
            {/* Profile Switcher */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Olá, {userName.split(' ')[0]} 👋</div>
                        <div style={{ fontSize: '0.83rem', color: 'var(--text-3)', marginTop: '0.2rem' }}>
                            Perfil ativo: <strong style={{ color: track === 'JUIZ' ? 'var(--gold)' : 'var(--proc-text)' }}>
                                {track === 'JUIZ' ? '⚖️ Magistrado (Juiz)' : '📋 Procurador do Estado'}
                            </strong>
                        </div>
                    </div>
                    <div className="profile-selector" style={{ margin: 0 }}>
                        <button
                            className={`profile-option ${track === 'JUIZ' ? 'active-juiz' : ''}`}
                            onClick={() => switchTrack('JUIZ')}
                            disabled={switchingTrack}
                        >
                            <div className="icon">⚖️</div>
                            <strong>Juiz</strong>
                            <span>Magistratura</span>
                        </button>
                        <button
                            className={`profile-option ${track === 'PROCURADOR' ? 'active-procurador' : ''}`}
                            onClick={() => switchTrack('PROCURADOR')}
                            disabled={switchingTrack}
                        >
                            <div className="icon">📋</div>
                            <strong>Procurador</strong>
                            <span>Procuradoria</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-number stat-accent">{totalPrecedents}</div>
                    <div className="stat-label">Precedentes disponíveis</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number stat-rose">{totalUnread}</div>
                    <div className="stat-label">Não lidos</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number stat-emerald">{totalRead}</div>
                    <div className="stat-label">Lidos</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number stat-gold">{subjects.length}</div>
                    <div className="stat-label">Matérias</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab ${tab === 'subjects' ? 'active' : ''}`} onClick={() => router.replace('/user/dashboard?tab=subjects')}>
                    📚 Matérias
                </button>
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
                    {loading && Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="skeleton" style={{ height: '90px', borderRadius: '12px' }} />
                    ))}
                    {!loading && subjects.map((s) => (
                        <button key={s.id} className="subject-card" onClick={() => openSubject(s.id)} style={{ textAlign: 'left', border: 'none', cursor: 'pointer', background: 'var(--surface)' }}>
                            <h3>{s.name}</h3>
                            <div className="unread-count">
                                {s.unreadCount > 0 && <span className="unread-dot" />}
                                <span>
                                    {s.unreadCount > 0 ? `${s.unreadCount} não lido(s)` : `${s.total} precedente(s)`}
                                    {' '}· {s.readCount}/{s.total} lido(s)
                                </span>
                            </div>
                        </button>
                    ))}
                    {!loading && subjects.length === 0 && (
                        <div className="empty-state">
                            <div className="icon">📭</div>
                            <p>Nenhuma matéria encontrada para este perfil.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Tab: Precedents */}
            {tab === 'precedents' && (
                <div>
                    <div className="filters-bar">
                        <input
                            type="text"
                            placeholder="🔍 Buscar precedente…"
                            value={q}
                            onChange={handleSearch}
                            style={{ flex: 1 }}
                        />
                        <select value={courtFilter} onChange={handleCourtFilter}>
                            <option value="">Tribunal: Todos</option>
                            <option value="STF">STF</option>
                            <option value="STJ">STJ</option>
                        </select>
                        <select value={selectedSubject ?? ''} onChange={(e) => { setSelectedSubject(e.target.value || null); setPage(1); fetchPrecedents(e.target.value || null, courtFilter, q, 1); }}>
                            <option value="">Todas as matérias</option>
                            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="list-stack">
                        {loadingPrecedents && Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '12px' }} />
                        ))}
                        {!loadingPrecedents && precedents.map((p) => (
                            <PrecedentCard
                                key={p.id}
                                precedent={p}
                                onToggleRead={(id, read) =>
                                    setPrecedents((prev) => prev.map((x) => x.id === id ? { ...x, isRead: read } : x))
                                }
                            />
                        ))}
                        {!loadingPrecedents && precedents.length === 0 && (
                            <div className="empty-state">
                                <div className="icon">🔍</div>
                                <p>Nenhum precedente encontrado.</p>
                            </div>
                        )}
                    </div>
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button className="page-btn" disabled={page <= 1} onClick={() => { setPage(page - 1); fetchPrecedents(selectedSubject, courtFilter, q, page - 1); }}>← Anterior</button>
                            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                const p = i + 1;
                                return <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => { setPage(p); fetchPrecedents(selectedSubject, courtFilter, q, p); }}>{p}</button>;
                            })}
                            <button className="page-btn" disabled={page >= totalPages} onClick={() => { setPage(page + 1); fetchPrecedents(selectedSubject, courtFilter, q, page + 1); }}>Próxima →</button>
                        </div>
                    )}
                </div>
            )}

            {/* Tab: News */}
            {tab === 'news' && (
                <div>
                    <div style={{ marginBottom: '1rem', color: 'var(--text-3)', fontSize: '0.875rem' }}>
                        Últimos {news.length} precedente(s) elegíveis ainda não lidos, ordenados por data de inserção.
                    </div>
                    <div className="list-stack">
                        {news.map((p) => (
                            <PrecedentCard
                                key={p.id}
                                precedent={p}
                                onToggleRead={(id, read) => {
                                    setNews((prev) => prev.map((x) => x.id === id ? { ...x, isRead: read } : x));
                                    fetchSubjects();
                                }}
                            />
                        ))}
                        {news.length === 0 && (
                            <div className="empty-state">
                                <div className="icon">🎉</div>
                                <p>Parabéns! Você está em dia com todas as novidades.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
