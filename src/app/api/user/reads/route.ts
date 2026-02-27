import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/guards';
import { z } from 'zod';

// POST /api/user/reads – toggle read status
const schema = z.object({
    precedentId: z.string(),
    read: z.boolean(),
});

export async function POST(req: NextRequest) {
    const { error, session } = await requireAuth(['USER', 'ADMIN', 'GESTOR']);
    if (error) return error;

    const userId = (session!.user as any).id as string;
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });

    const { precedentId, read } = parsed.data;

    if (read) {
        await prisma.precedentRead.upsert({
            where: { userId_precedentId: { userId, precedentId } },
            update: { readAt: new Date() },
            create: { userId, precedentId },
        });
    } else {
        await prisma.precedentRead.deleteMany({ where: { userId, precedentId } });
    }

    return NextResponse.json({ ok: true, precedentId, read });
}
