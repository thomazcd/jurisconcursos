import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/guards';
import { z } from 'zod';

const schema = z.object({
    court: z.enum(['STF', 'STJ', 'TRF', 'TJ']).optional(),
    title: z.string().min(5).max(500).optional(),
    summary: z.string().min(10).optional(),
    fullTextOrLink: z.string().optional().nullable(),
    subjectId: z.string().optional(),
    forAll: z.boolean().optional(),
    forProcurador: z.boolean().optional(),
    forJuizFederal: z.boolean().optional(),
    forJuizEstadual: z.boolean().optional(),
    judgmentDate: z.string().optional().nullable(),
    isRG: z.boolean().optional(),
    rgTheme: z.number().int().optional().nullable(),
    informatoryNumber: z.string().optional().nullable(),
    processClass: z.string().optional().nullable(),
    processNumber: z.string().optional().nullable(),
    organ: z.string().optional().nullable(),
    rapporteur: z.string().optional().nullable(),
    tags: z.array(z.string()).optional(),
});

// PUT /api/admin/precedents/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const { error } = await requireAuth(['ADMIN', 'GESTOR']);
    if (error) return error;

    try {
        const body = await req.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });

        const { judgmentDate, ...rest } = parsed.data;

        const precedent = await prisma.precedent.update({
            where: { id: params.id },
            data: {
                ...rest,
                ...(judgmentDate !== undefined ? { judgmentDate: judgmentDate ? new Date(judgmentDate) : null } : {}),
            },
            include: { subject: true },
        });
        return NextResponse.json({ precedent });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE /api/admin/precedents/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const { error } = await requireAuth(['ADMIN', 'GESTOR']);
    if (error) return error;

    await prisma.precedent.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
}
