import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id;

        const subjects = await prisma.subject.findMany({
            take: 10,
            select: { id: true, name: true }
        });

        const precedents = await prisma.precedent.findMany({
            take: 10,
            select: { id: true, title: true, subjectId: true }
        });

        return NextResponse.json({
            status: 'ok',
            sample: {
                subjects,
                precedents
            }
        });
    } catch (err: any) {
        return NextResponse.json({ status: 'error', error: err.message }, { status: 500 });
    }
}
