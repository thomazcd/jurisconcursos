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

    const [subjectCount, precedentCount, userCount] = await prisma.$transaction([
        prisma.subject.count(),
        prisma.precedent.count(),
        prisma.user.count({ where: { role: 'USER' } }),
    ]);

    const recentPrecedents = await prisma.precedent.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { subject: { select: { name: true } } },
    });

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

                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-number stat-accent">{precedentCount}</div>
                        <div className="stat-label">Precedentes cadastrados</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number stat-gold">{subjectCount}</div>
                        <div className="stat-label">Matérias cadastradas</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number stat-emerald">{userCount}</div>
                        <div className="stat-label">Usuários cadastrados</div>
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
                                    <th>Título</th>
                                    <th>Tribunal</th>
                                    <th>Matéria</th>
                                    <th>Aplicabilidade</th>
                                    <th>Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentPrecedents.map((p) => (
                                    <tr key={p.id}>
                                        <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {p.title}
                                        </td>
                                        <td><span className={`badge badge-${p.court.toLowerCase()}`}>{p.court}</span></td>
                                        <td>{p.subject.name}</td>
                                        <td><span className={`badge badge-${p.applicability.toLowerCase() === 'geral' ? 'geral' : p.applicability.toLowerCase() === 'juiz' ? 'juiz' : p.applicability.toLowerCase() === 'procurador' ? 'proc' : 'ambos'}`}>{p.applicability}</span></td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{new Date(p.createdAt).toLocaleDateString('pt-BR')}</td>
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
