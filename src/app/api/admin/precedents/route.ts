import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/guards';
import { z } from 'zod';

const schema = z.object({
    court: z.enum(['STF', 'STJ']),
    title: z.string().min(5).max(300),
    summary: z.string().min(10),
    fullTextOrLink: z.string().optional(),
    subjectId: z.string(),
    applicability: z.enum(['GERAL', 'JUIZ', 'PROCURADOR', 'AMBOS']),
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

    const [total, precedents] = await prisma.$transaction([
        prisma.precedent.count({ where }),
        prisma.precedent.findMany({
            where,
            include: { subject: true },
            orderBy: { createdAt: 'desc' },
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

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos', issues: parsed.error.issues }, { status: 400 });

    const precedent = await prisma.precedent.create({
        data: parsed.data,
        include: { subject: true },
    });
    return NextResponse.json({ precedent }, { status: 201 });
}
