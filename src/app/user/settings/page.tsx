import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/ui/Sidebar';
import SettingsClient from './SettingsClient';

export default async function UserSettingsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');
    const userId = (session.user as any).id;
    const role = (session.user as any).role;
    if (role === 'ADMIN' || role === 'GESTOR') redirect('/admin');

    const profile = await prisma.userProfile.findUnique({ where: { userId } });

    return (
        <div className="layout">
            <Sidebar role={role} name={session.user.name ?? ''} track={profile?.activeTrack} />
            <main className="main-content">
                <SettingsClient />
            </main>
        </div>
    );
}
