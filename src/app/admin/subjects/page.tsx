import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/ui/Sidebar';
import AdminSubjectsClient from './AdminSubjectsClient';

export default async function AdminSubjectsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');
    const role = (session.user as any).role;
    if (role === 'USER') redirect('/user/dashboard');

    return (
        <div className="layout">
            <Sidebar role={role} name={session.user.name ?? ''} />
            <main className="main-content">
                <AdminSubjectsClient />
            </main>
        </div>
    );
}
