import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/guards';
import { z } from 'zod';

const COURTS = ['STF', 'STJ', 'TRF', 'TJ'] as const;

const schema = z.object({
    court: z.enum(COURTS),
    title: z.string().min(2),
    summary: z.string().min(2),
    fullTextOrLink: z.string().optional().nullable(),
    subjectId: z.string(),
    forAll: z.boolean().default(false),
    forProcurador: z.boolean().default(false),
    forJuizFederal: z.boolean().default(false),
    forJuizEstadual: z.boolean().default(false),
    judgmentDate: z.string().optional().nullable(),
    isRG: z.boolean().default(false),
    rgTheme: z.number().int().optional().nullable(),
    informatoryNumber: z.string().optional().nullable(),
    processClass: z.string().optional().nullable(),
    processNumber: z.string().optional().nullable(),
    organ: z.string().optional().nullable(),
    rapporteur: z.string().optional().nullable(),
    theme: z.string().optional().nullable(),
    tags: z.array(z.string()).default([]),
});

export async function GET(req: NextRequest) {
    const { error } = await requireAuth(['ADMIN', 'GESTOR']);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');
    const search = searchParams.get('q');

    const where: any = {};
    if (subjectId) where.subjectId = subjectId;
    if (search) where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { theme: { contains: search, mode: 'insensitive' } },
        { processNumber: { contains: search, mode: 'insensitive' } },
    ];

    const precedents = await prisma.precedent.findMany({
        where,
        orderBy: [{ judgmentDate: 'desc' }, { createdAt: 'desc' }],
        include: { subject: { select: { name: true } } },
        take: 200,
    });
    return NextResponse.json({ precedents });
}

export async function POST(req: NextRequest) {
    const { error } = await requireAuth(['ADMIN', 'GESTOR']);
    if (error) return error;

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 });

    const { judgmentDate, ...rest } = parsed.data;
    const precedent = await prisma.precedent.create({
        data: { ...rest, judgmentDate: judgmentDate ? new Date(judgmentDate) : null },
    });
    return NextResponse.json({ precedent }, { status: 201 });
}
