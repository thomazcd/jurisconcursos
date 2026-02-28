import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const u = await prisma.user.count();
        const p = await prisma.precedent.count();
        const s = await prisma.subject.count();
        const pr = await prisma.precedentRead.count();
        const profile = await prisma.userProfile.count();

        return NextResponse.json({
            status: 'ok',
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
