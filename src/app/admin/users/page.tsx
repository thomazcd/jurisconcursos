import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminUsersClient from './AdminUsersClient';

export default async function AdminUsersPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role === 'USER') {
        redirect('/login');
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, createdAt: true, lastLoginAt: true }
    });

    const setting = await prisma.systemSetting.findUnique({
        where: { key: 'registration_open' }
    });

    // By default, registration is open if no setting is defined
    const isRegistrationOpen = setting ? setting.value === 'true' : true;

    return <AdminUsersClient initialUsers={users} initialRegistrationOpen={isRegistrationOpen} />;
}
