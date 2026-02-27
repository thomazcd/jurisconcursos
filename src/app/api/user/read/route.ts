import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/user/read – mark read (increment) or reset
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session.user as any).id;

    const { precedentId, action } = await req.json();
    if (!precedentId) return NextResponse.json({ error: 'precedentId required' }, { status: 400 });

    if (action === 'reset') {
        await prisma.precedentRead.upsert({
            where: { userId_precedentId: { userId, precedentId } },
            create: { userId, precedentId, readCount: 0, readEvents: [] },
            update: { readCount: 0, readEvents: [] },
        });
        return NextResponse.json({ readCount: 0 });
    }

    // default: increment
    const now = new Date();
    const existing = await prisma.precedentRead.findUnique({
        where: { userId_precedentId: { userId, precedentId } },
    });

    const newCount = (existing?.readCount ?? 0) + 1;
    const newEvents = [...(existing?.readEvents ?? []), now];

    await prisma.precedentRead.upsert({
        where: { userId_precedentId: { userId, precedentId } },
        create: { userId, precedentId, readCount: newCount, readEvents: newEvents },
        update: { readCount: newCount, readEvents: newEvents },
    });

    return NextResponse.json({ readCount: newCount });
}
