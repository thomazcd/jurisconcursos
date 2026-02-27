import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/guards';
import { z } from 'zod';

const TRACK_SCOPE = ['COMMON', 'PROCURADOR', 'JUIZ_FEDERAL', 'JUIZ_ESTADUAL'] as const;

const schema = z.object({
    name: z.string().min(2).max(120),
    trackScope: z.enum(TRACK_SCOPE),
    forProcurador: z.boolean().default(false),
    forJuizFederal: z.boolean().default(false),
    forJuizEstadual: z.boolean().default(false),
});

// GET /api/admin/subjects
export async function GET(req: NextRequest) {
    const { error } = await requireAuth(['ADMIN', 'GESTOR']);
    if (error) return error;

    const subjects = await prisma.subject.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ subjects });
}

// POST /api/admin/subjects
export async function POST(req: NextRequest) {
    const { error } = await requireAuth(['ADMIN', 'GESTOR']);
    if (error) return error;

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 });

    const subject = await prisma.subject.create({ data: parsed.data });
    return NextResponse.json({ subject }, { status: 201 });
}
