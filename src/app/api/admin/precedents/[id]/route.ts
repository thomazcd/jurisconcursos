import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/guards';
import { z } from 'zod';

const schema = z.object({
    court: z.enum(['STF', 'STJ']).optional(),
    title: z.string().min(5).max(300).optional(),
    summary: z.string().min(10).optional(),
    fullTextOrLink: z.string().optional(),
    subjectId: z.string().optional(),
    applicability: z.enum(['GERAL', 'JUIZ', 'PROCURADOR', 'AMBOS']).optional(),
    tags: z.array(z.string()).optional(),
});

// PUT /api/admin/precedents/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const { error } = await requireAuth(['ADMIN', 'GESTOR']);
    if (error) return error;

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });

    const precedent = await prisma.precedent.update({
        where: { id: params.id },
        data: parsed.data,
        include: { subject: true },
    });
    return NextResponse.json({ precedent });
}

// DELETE /api/admin/precedents/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const { error } = await requireAuth(['ADMIN', 'GESTOR']);
    if (error) return error;

    await prisma.precedent.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
}
