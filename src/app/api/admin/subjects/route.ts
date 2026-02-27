import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/guards';
import { z } from 'zod';

const schema = z.object({
    name: z.string().min(2).max(120),
    trackScope: z.enum(['COMMON', 'JUIZ', 'PROCURADOR']),
});

// GET /api/admin/subjects
export async function GET(req: NextRequest) {
    const { error } = await requireAuth(['ADMIN', 'GESTOR']);
    if (error) return error;

    const subjects = await prisma.subject.findMany({ orderBy: { trackScope: 'asc' } });
    return NextResponse.json({ subjects });
}

// POST /api/admin/subjects
export async function POST(req: NextRequest) {
    const { error } = await requireAuth(['ADMIN', 'GESTOR']);
    if (error) return error;

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });

    const subject = await prisma.subject.create({ data: parsed.data });
    return NextResponse.json({ subject }, { status: 201 });
}
