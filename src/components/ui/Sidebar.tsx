'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

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

    const active = (href: string) => pathname === href || pathname.startsWith(href + '/') ? 'active' : '';

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    async function handleSignOut() {
        await signOut({ redirect: false });
        router.push('/login');
    }

    return (
        <>
            {/* Mobile Header Toggle */}
            <div className="mobile-header no-print">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', color: 'var(--accent)', cursor: 'pointer', padding: '0.5rem' }}
                >
                    {isOpen ? '✕' : '☰'}
                </button>
                <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: '1.1rem' }}>⚖️ Juris</div>
                <div style={{ width: '40px' }}></div> {/* Spacer */}
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 999, backdropFilter: 'blur(2px)' }}
                />
            )}

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-logo">
                    <div className="logo-icon-container">
                        <span className="logo-icon">⚖️</span>
                    </div>
                    <div className="logo-text">
                        <h1 className="logo-title">Juris</h1>
                        <span className="logo-subtitle">Concursos</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {isAdmin ? (
                        <>
                            <p className="sidebar-section-title">Gestão</p>
                            <Link href="/admin" className={active('/admin') && !pathname.startsWith('/admin/subjects') && !pathname.startsWith('/admin/precedents') ? 'active' : ''}>
                                🏠 Home
                            </Link>
                            <Link href="/admin/subjects" className={active('/admin/subjects')}>
                                📚 Matérias
                            </Link>
                            <Link href="/admin/precedents" className={active('/admin/precedents')}>
                                ⚖️ Precedentes
                            </Link>
                        </>
                    ) : (
                        <>
                            <p className="sidebar-section-title">Estudo</p>
                            <Link href="/user/dashboard" className={active('/user/dashboard')}>
                                📰 Informativos
                            </Link>
                            <Link href="/user/teses" className={active('/user/teses')}>
                                📜 Teses STF/STJ
                            </Link>
                            <Link href="/user/stats" className={active('/user/stats')}>
                                📊 Desempenho
                            </Link>
                            <Link href="/user/settings" className={active('/user/settings')}>
                                ⚙️ Configurações
                            </Link>
                        </>
                    )}
                </nav>

                <div className="sidebar-footer" style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>{name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                            {isAdmin ? (role === 'ADMIN' ? 'Administrador' : 'Gestor') : `${track === 'JUIZ_FEDERAL' ? '🏛️ Juiz Federal' : track === 'JUIZ_ESTADUAL' ? '⚖️ Juiz Estadual' : '📋 Procurador'}`}
                        </div>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', marginBottom: '0.5rem', opacity: 0.6 }}>
                        v1.00041
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSignOut}>
                        Sair
                    </button>
                </div>
            </aside>
        </>
    );
}
