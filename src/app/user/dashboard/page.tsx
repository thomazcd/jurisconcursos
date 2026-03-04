import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import DashboardClient from './DashboardClient';
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function UserDashboardPage() {
    noStore();
    const session = await getServerSession(authOptions);
    return <DashboardClient userName={session?.user?.name ?? ''} />;
}
