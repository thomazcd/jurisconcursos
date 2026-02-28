import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const u = await prisma.user.count();
        const p = await prisma.precedent.count();
        const s = await prisma.subject.count();
        const pr = await prisma.precedentRead.count();
        const profile = await prisma.userProfile.count();

        return NextResponse.json({
            status: 'ok',
            session_active: !!session,
            user_id_in_session: (session?.user as any)?.id,
            counts: {
                users: u,
                precedents: p,
                subjects: s,
                precedent_reads: pr,
                user_profiles: profile
            },
            database_url_present: !!process.env.DATABASE_URL
        });
    } catch (err: any) {
        return NextResponse.json({
            status: 'error',
            error: err.message,
            stack: err.stack
        }, { status: 500 });
    }
}
