import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import RadarClient from './RadarClient';

export default async function RadarPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect('/login');
    }


    return <RadarClient />;
}
