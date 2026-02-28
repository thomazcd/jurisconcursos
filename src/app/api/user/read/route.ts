import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/user/read – handles reads and flashcard results
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session.user as any).id;

    const { precedentId, action, isCorrect } = await req.json();
    if (!precedentId) return NextResponse.json({ error: 'precedentId required' }, { status: 400 });

    const now = new Date();

    if (action === 'bulk_reset_reads') {
        await prisma.precedentRead.updateMany({
            where: { userId },
            data: { readCount: 0, readEvents: [] },
        });
        return NextResponse.json({ success: true });
    }

    if (action === 'bulk_reset_stats') {
        await prisma.precedentRead.updateMany({
            where: { userId },
            data: { correctCount: 0, wrongCount: 0, lastResult: null },
        });
        return NextResponse.json({ success: true });
    }

    if (action === 'reset') {
        const result = await prisma.precedentRead.upsert({
            where: { userId_precedentId: { userId, precedentId } },
            create: { userId, precedentId, readCount: 0, readEvents: [], correctCount: 0, wrongCount: 0, lastResult: null },
            update: { readCount: 0, readEvents: [], correctCount: 0, wrongCount: 0, lastResult: null },
        });
        return NextResponse.json({ readCount: 0, readEvents: [], correctCount: 0, wrongCount: 0 });
    }

    if (action === 'decrement') {
        const existing = await prisma.precedentRead.findUnique({
            where: { userId_precedentId: { userId, precedentId } },
        });
        if (!existing || existing.readCount <= 0) {
            return NextResponse.json({ readCount: 0, readEvents: [] });
        }

        const newCount = existing.readCount - 1;
        const newEvents = existing.readEvents.slice(0, -1); // Remove o último evento

        const result = await prisma.precedentRead.update({
            where: { userId_precedentId: { userId, precedentId } },
            data: { readCount: newCount, readEvents: newEvents },
        });

        return NextResponse.json({ readCount: newCount, readEvents: newEvents });
    }

    if (action === 'toggle_favorite') {
        const existing = await prisma.precedentRead.findUnique({
            where: { userId_precedentId: { userId, precedentId } },
        });

        const result = await prisma.precedentRead.upsert({
            where: { userId_precedentId: { userId, precedentId } },
            create: { userId, precedentId, isFavorite: true },
            update: { isFavorite: !(existing?.isFavorite ?? false) },
        });

        return NextResponse.json({ isFavorite: result.isFavorite });
    }

    if (action === 'flashcard') {
        const existing = await prisma.precedentRead.findUnique({
            where: { userId_precedentId: { userId, precedentId } },
        });

        const updateData: any = {
            correctCount: (existing?.correctCount ?? 0) + (isCorrect ? 1 : 0),
            wrongCount: (existing?.wrongCount ?? 0) + (isCorrect ? 0 : 1),
            lastResult: isCorrect ? 'HIT' : 'MISS',
            // Also increment readCount automatically when doing flashcards
            readCount: (existing?.readCount ?? 0) + 1,
            readEvents: [...(existing?.readEvents ?? []), now],
        };

        const result = await prisma.precedentRead.upsert({
            where: { userId_precedentId: { userId, precedentId } },
            create: { userId, precedentId, ...updateData },
            update: updateData,
        });

        return NextResponse.json({
            correctCount: result.correctCount,
            wrongCount: result.wrongCount,
            lastResult: result.lastResult,
            readCount: result.readCount
        });
    }

    // default: increment read
    const existing = await prisma.precedentRead.findUnique({
        where: { userId_precedentId: { userId, precedentId } },
    });

    const newCount = (existing?.readCount ?? 0) + 1;
    const newEvents = [...(existing?.readEvents ?? []), now];

    const result = await prisma.precedentRead.upsert({
        where: { userId_precedentId: { userId, precedentId } },
        create: { userId, precedentId, readCount: newCount, readEvents: newEvents },
        update: { readCount: newCount, readEvents: newEvents },
    });

    return NextResponse.json({ readCount: newCount, readEvents: newEvents });
}
