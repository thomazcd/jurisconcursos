import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/ui/Sidebar';

export default async function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    // Admin/Gestor shouldn't be in the user section
    if (role === 'ADMIN' || role === 'GESTOR') redirect('/admin');

    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    const track = profile?.activeTrack ?? 'JUIZ_ESTADUAL';

    return (
        <div className="layout">
            <Sidebar role={role} name={session.user.name ?? ''} track={track} />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
