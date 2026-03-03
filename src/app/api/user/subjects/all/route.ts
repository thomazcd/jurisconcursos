import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/guards';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { error } = await requireAuth(['USER', 'ADMIN', 'GESTOR']);
    if (error) return error;

    const subjects = await prisma.subject.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true }
    });

    return NextResponse.json({ subjects });
}
