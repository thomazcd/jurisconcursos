'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { APP_VERSION } from '@/lib/version';
import { Logo } from '@/components/ui/Logo';
import { Icons as SvgIcons } from '@/components/ui/Icons';

interface SidebarProps {
    role: string;
    name: string;
    track?: string;
}

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
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-2)', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center' }}
                >
                    {isOpen ? <SvgIcons.X size={24} /> : <SvgIcons.Menu size={24} />}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, var(--accent), #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        <SvgIcons.Scale size={16} />
                    </div>
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

            <aside className={`sidebar ${isOpen ? 'open' : ''}`} style={{ width: 280 }}>
                {/* Logo */}
                <div style={{ padding: '1.5rem 1.25rem 1.75rem', borderBottom: '1px solid var(--border)' }}>
                    <Logo size="medium" />
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
                    {isAdmin ? (
                        <>
                            <p style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', padding: '0 0.5rem 0.6rem', marginBottom: '0.2rem' }}>Gestão</p>
                            <NavLink href="/admin" icon={<SvgIcons.Home size={18} />} label="Dashboard"
                                active={pathname === '/admin' || (pathname.startsWith('/admin') && !pathname.startsWith('/admin/subjects') && !pathname.startsWith('/admin/precedents'))}
                            />
                            <NavLink href="/admin/subjects" icon={<SvgIcons.Subjects size={18} />} label="Matérias" />
                            <NavLink href="/admin/precedents" icon={<SvgIcons.Gavel size={18} />} label="Precedentes" />
                        </>
                    ) : (
                        <>
                            <p style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', padding: '0 0.5rem 0.6rem', marginBottom: '0.2rem' }}>Estudo</p>
                            <NavLink
                                href="/user/dashboard"
                                icon={<SvgIcons.Book size={18} />}
                                label="Informativos"
                                badge={progress && (
                                    <div className="progress-mini-container" style={{ flexShrink: 0 }}>
                                        <div className="progress-mini">
                                            <div className="progress-mini-bar" style={{ width: `${Math.min(100, (progress.read / progress.total) * 100)}%` }} />
                                        </div>
                                        <span className="percentage-badge" style={{ flexShrink: 0, minWidth: '32px', textAlign: 'right' }}>{Math.round((progress.read / progress.total) * 100)}%</span>
                                    </div>
                                )}
                            />
                            <NavLink
                                href="#"
                                icon={<SvgIcons.Gavel size={18} />}
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
                                        <SvgIcons.Soon size={14} /> Em breve
                                    </span>
                                }
                            />
                            <NavLink href="/user/stats" icon={<SvgIcons.Chart size={18} />} label="Desempenho" />

                            <div style={{ height: '1px', background: 'var(--border)', margin: '0.75rem 0.5rem' }} />

                            <NavLink href="/user/settings" icon={<SvgIcons.Settings size={18} />} label="Configurações" />
                            <NavLink href="/user/novidades" icon={<SvgIcons.Sparkles size={18} />} label="Novidades" />
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
                        animation: 'fadeIn 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}>
                        <SvgIcons.Briefcase size={14} /> Conteúdo em construção — em breve!
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
                            <SvgIcons.Logout size={16} /> Sair
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
