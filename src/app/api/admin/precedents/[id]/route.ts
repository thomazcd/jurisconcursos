import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/guards';
import { z } from 'zod';

const COURTS = ['STF', 'STJ', 'TRF', 'TJ'] as const;

const schema = z.object({
    court: z.enum(COURTS).optional(),
    title: z.string().min(2).optional(),
    summary: z.string().min(2).optional(),
    fullTextOrLink: z.string().optional().nullable(),
    subjectIds: z.array(z.string()).optional(),
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
    theme: z.string().optional().nullable(),
    tags: z.array(z.string()).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const { error } = await requireAuth(['ADMIN', 'GESTOR']);
    if (error) return error;

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 });

    const { judgmentDate, subjectIds, ...rest } = parsed.data;

    const updateData: any = {
        ...rest,
        ...(judgmentDate !== undefined ? { judgmentDate: judgmentDate ? new Date(judgmentDate) : null } : {}),
    };

    if (subjectIds !== undefined) {
        updateData.subjects = {
            set: subjectIds.map(id => ({ id }))
        };
        updateData.subjectId = subjectIds[0] || null;
    }

    const precedent = await prisma.precedent.update({
        where: { id: params.id },
        data: updateData,
        include: { subjects: true }
    });
    return NextResponse.json({ precedent });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const { error } = await requireAuth(['ADMIN', 'GESTOR']);
    if (error) return error;
    await prisma.precedent.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
}
