import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/guards';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
    key: z.string(),
    value: z.string()
});

export async function POST(req: NextRequest) {
    const { error } = await requireAuth(['ADMIN', 'GESTOR']);
    if (error) return error;

    try {
        const body = await req.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
        }

        const { key, value } = parsed.data;

        await prisma.systemSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('API /admin/settings error:', err);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
