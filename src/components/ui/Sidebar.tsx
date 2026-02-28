'use client';
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
    const isAdmin = role === 'ADMIN' || role === 'GESTOR';

    const active = (href: string) => pathname === href || pathname.startsWith(href + '/') ? 'active' : '';

    async function handleSignOut() {
        await signOut({ redirect: false });
        router.push('/login');
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h1>⚖️ Juris Concursos</h1>
                <span>Jurisprudência para concursos</span>
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
                    v1.00022
                </div>
                <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSignOut}>
                    Sair
                </button>
            </div>
        </aside>
    );
}
