import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardClient from './DashboardClient';

export default async function UserDashboardPage() {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any).id;
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    const track = profile?.activeTrack ?? 'JUIZ_ESTADUAL';

    return <DashboardClient userName={session?.user?.name ?? ''} track={track} />;
}
