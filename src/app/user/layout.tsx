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

    const userId = session.user.id;
    const role = session.user.role;

    // Admin/Gestor shouldn't be in the user section
    if (role === 'ADMIN' || role === 'GESTOR') redirect('/admin');

    return (
        <div className="layout">
            <Sidebar role={role} name={session.user.name ?? ''} email={session.user.email ?? ''} />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
