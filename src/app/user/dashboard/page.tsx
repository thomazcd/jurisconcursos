import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardClient from './DashboardClient';
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function UserDashboardPage() {
    noStore();
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any).id;
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    return <DashboardClient userName={session?.user?.name ?? ''} />;
}
