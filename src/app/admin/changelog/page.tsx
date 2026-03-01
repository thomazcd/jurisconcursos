
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/ui/Sidebar';
import { CHANGELOG } from '@/lib/changelog';
import { Icons as SvgIcons } from '@/components/ui/Icons';

export default async function AdminChangelogPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');

    const role = (session.user as any).role;
    if (role === 'USER') redirect('/user/dashboard');

    return (
        <div className="layout">
            <Sidebar role={role} name={session.user.name ?? ''} />
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Log de Versões</h1>
                        <p className="page-subtitle">Acompanhe a evolução e as atualizações do sistema</p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {CHANGELOG.map((entry) => (
                        <div key={entry.version} className="card" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        v{entry.version}
                                    </h2>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-1)', fontWeight: 600, marginTop: '0.4rem' }}>
                                        {entry.description}
                                    </p>
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', background: 'var(--surface2)', padding: '4px 12px', borderRadius: 20, border: '1px solid var(--border)' }}>
                                    {entry.date}
                                </span>
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {entry.changes.map((change, idx) => (
                                    <li key={idx} style={{ fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.5 }}>
                                        {change}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </main>

            <style jsx>{`
                ul li::marker {
                    color: var(--accent);
                    content: "• ";
                    font-weight: bold;
                }
            `}</style>
        </div>
    );
}
