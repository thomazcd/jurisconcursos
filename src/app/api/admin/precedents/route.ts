import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/guards';
import { z } from 'zod';

const schema = z.object({
    court: z.enum(['STF', 'STJ', 'TRF', 'TJ']),
    title: z.string().min(5).max(500),
    summary: z.string().min(10),
    fullTextOrLink: z.string().optional().nullable(),
    subjectId: z.string(),
    // Multi-track applicability
    forAll: z.boolean().default(true),
    forProcurador: z.boolean().default(false),
    forJuizFederal: z.boolean().default(false),
    forJuizEstadual: z.boolean().default(false),
    // Rich fields
    judgmentDate: z.string().optional().nullable(), // ISO string
    isRG: z.boolean().default(false),
    rgTheme: z.number().int().optional().nullable(),
    informatoryNumber: z.string().optional().nullable(),
    processClass: z.string().optional().nullable(),
    processNumber: z.string().optional().nullable(),
    organ: z.string().optional().nullable(),
    rapporteur: z.string().optional().nullable(),
    tags: z.array(z.string()).optional().default([]),
});

// GET /api/admin/precedents
export async function GET(req: NextRequest) {
    const { error } = await requireAuth(['ADMIN', 'GESTOR']);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');
    const court = searchParams.get('court');
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '20');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (subjectId) where.subjectId = subjectId;
    if (court) where.court = court;

    const [total, precedents] = await Promise.all([
        prisma.precedent.count({ where }),
        prisma.precedent.findMany({
            where,
            include: { subject: true },
            orderBy: [{ judgmentDate: 'desc' }, { createdAt: 'desc' }],
            skip,
            take: limit,
        }),
    ]);

    return NextResponse.json({ precedents, total, page, limit });
}

// POST /api/admin/precedents
export async function POST(req: NextRequest) {
    const { error } = await requireAuth(['ADMIN', 'GESTOR']);
    if (error) return error;

    try {
        const body = await req.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos', issues: parsed.error.issues }, { status: 400 });

        const { judgmentDate, ...rest } = parsed.data;

        const precedent = await prisma.precedent.create({
            data: {
                ...rest,
                judgmentDate: judgmentDate ? new Date(judgmentDate) : null,
            },
            include: { subject: true },
        });
        return NextResponse.json({ precedent }, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
