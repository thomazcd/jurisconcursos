import { requireAuth } from '@/lib/auth';
import StatsClient from './StatsClient';

export default async function StatsPage() {
    const session = await requireAuth();
    return (
        <main className="user-layout">
            <StatsClient />
        </main>
    );
}
