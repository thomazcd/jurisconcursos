'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { APP_VERSION } from '@/lib/version';
import { Logo } from '@/components/ui/Logo';

interface SidebarProps {
    role: string;
    name: string;
    track?: string;
}

// SVG Icons — minimalistas, estilo Lucide
const Icons = {
    home: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9L12 2l9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    book: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>,
    gavel: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L11 10" /><path d="m16 16 6-6" /><path d="m8 8 6-6" /><path d="m9 7 8 8" /><path d="m21 11-8-8" /></svg>,
    chart: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
    settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
    sparkles: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>,
    subjects: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
    logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    soon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    sun: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
    moon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
};

export function Sidebar({ role, name, track }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const isAdmin = role === 'ADMIN' || role === 'GESTOR';
    const [showComingSoon, setShowComingSoon] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [progress, setProgress] = useState<{ total: number, read: number } | null>(null);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark-theme'));

        // Fetch progress
        fetch('/api/user/subjects')
            .then(r => r.json())
            .then(d => {
                const total = d.subjects?.reduce((acc: number, s: any) => acc + (s.total || 0), 0) || 0;
                const read = d.subjects?.reduce((acc: number, s: any) => acc + (s.readCount || 0), 0) || 0;
                setProgress({ total, read });
            })
            .catch(() => { });
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        document.documentElement.classList.toggle('dark-theme', next);
        localStorage.setItem('juris-theme', next ? 'dark' : 'light');
    };

    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(href + '/');

    useEffect(() => { setIsOpen(false); }, [pathname]);

    async function handleSignOut() {
        await signOut({ redirect: false });
        router.push('/login');
    }

    const triggerComingSoon = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowComingSoon(true);
        setTimeout(() => setShowComingSoon(false), 3000);
    };

    const trackLabel =
        track === 'JUIZ_FEDERAL' ? 'Juiz Federal' :
            track === 'JUIZ_ESTADUAL' ? 'Juiz Estadual' :
                'Procurador';

    const NavLink = ({
        href,
        icon,
        label,
        badge,
        onClick,
        active,
    }: {
        href: string;
        icon: React.ReactNode;
        label: string;
        badge?: React.ReactNode;
        onClick?: (e: React.MouseEvent) => void;
        active?: boolean;
    }) => {
        const isAct = active ?? isActive(href);
        return (
            <Link
                href={href}
                onClick={onClick}
                className={isAct ? 'active' : ''}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.6rem 0.9rem',
                    borderRadius: 10,
                    fontSize: '0.875rem',
                    fontWeight: isAct ? 700 : 500,
                    color: isAct ? 'var(--accent)' : 'var(--text-2)',
                    background: isAct ? 'rgba(20,184,166,0.08)' : 'transparent',
                    border: isAct ? '1px solid rgba(20,184,166,0.15)' : '1px solid transparent',
                    transition: 'all 0.15s',
                    marginBottom: '2px',
                    textDecoration: 'none',
                    position: 'relative',
                    overflow: 'hidden',
                }}
                onMouseEnter={e => {
                    if (!isAct) {
                        e.currentTarget.style.background = 'var(--surface2)';
                        e.currentTarget.style.color = 'var(--text)';
                    }
                }}
                onMouseLeave={e => {
                    if (!isAct) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-2)';
                    }
                }}
            >
                <span style={{ opacity: isAct ? 1 : 0.6, flexShrink: 0, display: 'flex' }}>{icon}</span>
                <span style={{ flex: 1 }}>{label}</span>
                {badge}
            </Link>
        );
    };

    return (
        <>
            {/* Mobile Header */}
            <div className="mobile-header no-print">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ background: 'transparent', border: 'none', fontSize: '1.4rem', color: 'var(--text-2)', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center' }}
                >
                    {isOpen ? '✕' : '☰'}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, var(--accent), #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>⚖️</div>
                    <span style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--text)', letterSpacing: '-0.03em' }}>Juris</span>
                </div>
                <div style={{ width: 40 }} />
            </div>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 999, backdropFilter: 'blur(3px)' }}
                />
            )}

            <aside className={`sidebar ${isOpen ? 'open' : ''}`} style={{ width: 240 }}>

                {/* Logo & Theme Toggle */}
                <div style={{ padding: '1.5rem 1.25rem 1.75rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Logo size="medium" />
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
                            color: 'var(--text-2)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
                    >
                        {isDark ? Icons.sun : Icons.moon}
                    </button>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
                    {isAdmin ? (
                        <>
                            <p style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', padding: '0 0.5rem 0.6rem', marginBottom: '0.2rem' }}>Gestão</p>
                            <NavLink href="/admin" icon={Icons.home} label="Dashboard"
                                active={pathname === '/admin' || (pathname.startsWith('/admin') && !pathname.startsWith('/admin/subjects') && !pathname.startsWith('/admin/precedents'))}
                            />
                            <NavLink href="/admin/subjects" icon={Icons.subjects} label="Matérias" />
                            <NavLink href="/admin/precedents" icon={Icons.gavel} label="Precedentes" />
                        </>
                    ) : (
                        <>
                            <p style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', padding: '0 0.5rem 0.6rem', marginBottom: '0.2rem' }}>Estudo</p>
                            <NavLink
                                href="/user/dashboard"
                                icon={Icons.book}
                                label="Informativos"
                                badge={progress && (
                                    <div className="progress-mini-container">
                                        <div className="progress-mini">
                                            <div className="progress-mini-bar" style={{ width: `${Math.min(100, (progress.read / progress.total) * 100)}%` }} />
                                        </div>
                                        <span className="percentage-badge">{Math.round((progress.read / progress.total) * 100)}%</span>
                                    </div>
                                )}
                            />
                            <NavLink
                                href="#"
                                icon={Icons.gavel}
                                label="Teses STF/STJ"
                                onClick={triggerComingSoon}
                                active={false}
                                badge={
                                    <span style={{
                                        fontSize: '0.6rem', fontWeight: 800,
                                        background: 'rgba(20,184,166,0.12)', color: 'var(--accent)',
                                        padding: '2px 6px', borderRadius: 6,
                                        display: 'flex', alignItems: 'center', gap: 3
                                    }}>
                                        {Icons.soon} Em breve
                                    </span>
                                }
                            />
                            <NavLink href="/user/stats" icon={Icons.chart} label="Desempenho" />

                            <div style={{ height: '1px', background: 'var(--border)', margin: '0.75rem 0.5rem' }} />

                            <NavLink href="/user/settings" icon={Icons.settings} label="Configurações" />
                            <NavLink href="/user/novidades" icon={Icons.sparkles} label="Novidades" />
                        </>
                    )}
                </nav>

                {/* Coming-soon toast */}
                {showComingSoon && !isAdmin && (
                    <div style={{
                        margin: '0 0.75rem 0.75rem',
                        background: 'rgba(20,184,166,0.08)',
                        color: 'var(--accent)',
                        fontSize: '0.72rem',
                        padding: '0.6rem 0.75rem',
                        borderRadius: 10,
                        fontWeight: 700,
                        border: '1px solid rgba(20,184,166,0.2)',
                        textAlign: 'center',
                        animation: 'fadeIn 0.2s'
                    }}>
                        🚧 Conteúdo em construção — em breve!
                    </div>
                )}

                {/* Footer */}
                <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)' }}>
                    {/* User info */}
                    <div style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: 10,
                        background: 'var(--surface2)',
                        border: '1px solid var(--border)',
                        marginBottom: '0.6rem',
                        display: 'flex', alignItems: 'center', gap: '0.6rem'
                    }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--accent), #0ea5e9)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '0.85rem', fontWeight: 900, flexShrink: 0
                        }}>
                            {name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 700 }}>
                                {isAdmin ? (role === 'ADMIN' ? 'Administrador' : 'Gestor') : trackLabel}
                            </div>
                        </div>
                    </div>

                    {/* Version + Logout */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', opacity: 0.5, fontWeight: 600 }}>v{APP_VERSION}</div>
                            <div style={{ fontSize: '0.58rem', color: 'var(--text-3)', opacity: 0.4, fontWeight: 500, marginTop: 1 }}>por Thomaz C. Drumond</div>
                        </div>
                        <button
                            onClick={handleSignOut}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                border: '1px solid var(--border)', background: 'transparent',
                                cursor: 'pointer', padding: '5px 10px', borderRadius: 8,
                                fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)',
                                transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent'; }}
                        >
                            {Icons.logout} Sair
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
