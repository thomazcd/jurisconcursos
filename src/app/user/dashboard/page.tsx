import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/ui/Sidebar';
import DashboardClient from './DashboardClient';

export default async function UserDashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');

    const userId = (session.user as any).id;
    const role = (session.user as any).role;
    if (role === 'ADMIN' || role === 'GESTOR') redirect('/admin');

    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    const track = profile?.activeTrack ?? 'JUIZ';

    return (
        <div className="layout">
            <Sidebar role={role} name={session.user.name ?? ''} track={track} />
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Dashboard de Estudos</h1>
                        <p className="page-subtitle">
                            Acompanhe seu progresso e estude os precedentes do STF e STJ
                        </p>
                    </div>
                </div>
                <DashboardClient userName={session.user.name ?? ''} track={track} />
            </main>
        </div>
    );
}
