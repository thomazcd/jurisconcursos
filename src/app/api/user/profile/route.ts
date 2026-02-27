import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/guards';
import { z } from 'zod';

const schema = z.object({ activeTrack: z.enum(['JUIZ_ESTADUAL', 'JUIZ_FEDERAL', 'PROCURADOR']) });

// GET current profile
export async function GET(req: NextRequest) {
    const { error, session } = await requireAuth(['USER', 'ADMIN', 'GESTOR']);
    if (error) return error;

    const userId = (session!.user as any).id as string;
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    return NextResponse.json({ profile });
}

// PATCH – switch active track
export async function PATCH(req: NextRequest) {
    const { error, session } = await requireAuth(['USER', 'ADMIN', 'GESTOR']);
    if (error) return error;

    const userId = (session!.user as any).id as string;
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });

    const profile = await prisma.userProfile.upsert({
        where: { userId },
        update: { activeTrack: parsed.data.activeTrack },
        create: { userId, activeTrack: parsed.data.activeTrack },
    });
    return NextResponse.json({ profile });
}
