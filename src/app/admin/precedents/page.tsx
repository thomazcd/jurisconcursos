import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/ui/Sidebar';
import AdminPrecedentsClient from './AdminPrecedentsClient';

export default async function AdminPrecedentsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');
    const role = (session.user as any).role;
    if (role === 'USER') redirect('/user/dashboard');

    return (
        <div className="layout">
            <Sidebar role={role} name={session.user.name ?? ''} />
            <main className="main-content">
                <AdminPrecedentsClient />
            </main>
        </div>
    );
}
