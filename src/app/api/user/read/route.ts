import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/guards';
import { prisma } from '@/lib/prisma';

// POST /api/user/read – handles reads and flashcard results
export async function POST(req: NextRequest) {
    const { error, session } = await requireAuth(['USER', 'ADMIN', 'GESTOR']);
    if (error) return error;
    const userId = (session!.user as any).id;

    const { precedentId, action, isCorrect, notes } = await req.json();
    if (!precedentId) return NextResponse.json({ error: 'precedentId required' }, { status: 400 });

    const now = new Date();

    if (action === 'save_note') {
        const result = await prisma.precedentRead.upsert({
            where: { userId_precedentId: { userId, precedentId } },
            create: { userId, precedentId, notes },
            update: { notes },
        });
        return NextResponse.json({ notes: result.notes });
    }

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
        const result = await prisma.precedentRead.upsert({
            where: { userId_precedentId: { userId, precedentId } },
            create: {
                userId,
                precedentId,
                correctCount: isCorrect ? 1 : 0,
                wrongCount: isCorrect ? 0 : 1,
                lastResult: isCorrect ? 'HIT' : 'MISS',
                readCount: 1,
                readEvents: [now]
            },
            update: {
                correctCount: { increment: isCorrect ? 1 : 0 },
                wrongCount: { increment: isCorrect ? 0 : 1 },
                lastResult: isCorrect ? 'HIT' : 'MISS',
                readCount: { increment: 1 },
                readEvents: { push: now }
            },
        });

        return NextResponse.json({
            correctCount: result.correctCount,
            wrongCount: result.wrongCount,
            lastResult: result.lastResult,
            readCount: result.readCount
        });
    }

    // default: increment read
    const result = await prisma.precedentRead.upsert({
        where: { userId_precedentId: { userId, precedentId } },
        create: { userId, precedentId, readCount: 1, readEvents: [now] },
        update: {
            readCount: { increment: 1 },
            readEvents: { push: now }
        },
    });

    return NextResponse.json({ readCount: result.readCount, readEvents: result.readEvents });
}
