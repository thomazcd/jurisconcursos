import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/guards';
import { z } from 'zod';

const schema = z.object({
    name: z.string().min(2).max(120).optional(),
    trackScope: z.enum(['COMMON', 'JUIZ', 'PROCURADOR']).optional(),
});

// PUT /api/admin/subjects/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const { error } = await requireAuth(['ADMIN', 'GESTOR']);
    if (error) return error;

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });

    const subject = await prisma.subject.update({ where: { id: params.id }, data: parsed.data });
    return NextResponse.json({ subject });
}

// DELETE /api/admin/subjects/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const { error } = await requireAuth(['ADMIN', 'GESTOR']);
    if (error) return error;

    await prisma.subject.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
}
