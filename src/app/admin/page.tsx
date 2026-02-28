import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/ui/Sidebar';

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');

    const role = (session.user as any).role;
    if (role === 'USER') redirect('/user/dashboard');

    let subjectCount = 0, precedentCount = 0, userCount = 0;
    let recentPrecedents: any[] = [];
    let dbError: string | null = null;

    try {
        [subjectCount, precedentCount, userCount] = await Promise.all([
            prisma.subject.count(),
            prisma.precedent.count(),
            prisma.user.count({ where: { role: 'USER' } }),
        ]);
        recentPrecedents = await prisma.precedent.findMany({
            orderBy: [{ judgmentDate: 'desc' }, { createdAt: 'desc' }],
            take: 5,
            include: { subjects: { select: { name: true } } },
        });
    } catch (e: any) {
        dbError = e.message ?? String(e);
    }

    function appLabel(p: any) {
        if (p.forAll) return 'Geral';
        const t = [];
        if (p.forProcurador) t.push('PGE');
        if (p.forJuizFederal) t.push('J.Fed');
        if (p.forJuizEstadual) t.push('J.Est');
        return t.join(' + ') || '—';
    }

    return (
        <div className="layout">
            <Sidebar role={role} name={session.user.name ?? ''} />
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Painel do Gestor</h1>
                        <p className="page-subtitle">Gerencie matérias e precedentes do sistema</p>
                    </div>
                </div>

                {dbError && (
                    <div style={{ background: '#fee2e2', border: '1px solid #f87171', borderRadius: 8, padding: '1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#991b1b', wordBreak: 'break-all' }}>
                        <strong>Erro de banco:</strong> {dbError}
                    </div>
                )}

                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-number stat-accent">{precedentCount}</div>
                        <div className="stat-label">Precedentes</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number stat-gold">{subjectCount}</div>
                        <div className="stat-label">Matérias</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number stat-emerald">{userCount}</div>
                        <div className="stat-label">Usuários</div>
                    </div>
                </div>

                <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-2)' }}>
                    Precedentes recentes
                </h2>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Data</th><th>Título</th><th>Tribunal</th><th>Matéria</th><th>Visível para</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentPrecedents.length === 0 && (
                                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-3)' }}>
                                        {dbError ? 'Erro ao carregar dados.' : 'Nenhum precedente ainda.'}
                                    </td></tr>
                                )}
                                {recentPrecedents.map((p) => (
                                    <tr key={p.id}>
                                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem', color: 'var(--text-3)' }}>
                                            {p.judgmentDate ? new Date(p.judgmentDate).toLocaleDateString('pt-BR') : '—'}
                                        </td>
                                        <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</td>
                                        <td><span className={`badge badge-${p.court.toLowerCase()}`}>{p.court}</span></td>
                                        <td style={{ fontSize: '0.82rem' }}>
                                            {p.subjects?.map((s: any) => s.name).join(', ') || '—'}
                                        </td>
                                        <td><span className="badge badge-geral">{appLabel(p)}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
