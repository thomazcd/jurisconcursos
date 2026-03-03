import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/guards';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

const schema = z.object({
    activeTrack: z.enum(['JUIZ_ESTADUAL', 'JUIZ_FEDERAL', 'PROCURADOR', 'TODAS']).optional(),
    selectedSubjectIds: z.array(z.string()).optional()
});

// GET current profile
export async function GET(req: NextRequest) {
    const { error, session } = await requireAuth(['USER', 'ADMIN', 'GESTOR']);
    if (error) return error;

    const userId = (session!.user as any).id as string;
    const profile = await prisma.userProfile.findUnique({
        where: { userId },
        include: { selectedSubjects: { select: { id: true } } }
    });
    return NextResponse.json({ profile });
}

// PATCH – switch active track or update subjects
export async function PATCH(req: NextRequest) {
    const { error, session } = await requireAuth(['USER', 'ADMIN', 'GESTOR']);
    if (error) return error;

    const userId = (session!.user as any).id as string;
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });

    const updateData: any = {};
    if (parsed.data.activeTrack) updateData.activeTrack = parsed.data.activeTrack;
    if (parsed.data.selectedSubjectIds !== undefined) {
        updateData.selectedSubjects = {
            set: parsed.data.selectedSubjectIds.map(id => ({ id }))
        };
    }

    const profile = await prisma.userProfile.upsert({
        where: { userId },
        update: updateData,
        create: {
            userId,
            activeTrack: (parsed.data.activeTrack as any) || 'JUIZ_ESTADUAL',
            selectedSubjects: parsed.data.selectedSubjectIds ? {
                connect: parsed.data.selectedSubjectIds.map(id => ({ id }))
            } : undefined
        },
        include: { selectedSubjects: { select: { id: true } } }
    });

    revalidatePath('/user/dashboard');
    revalidatePath('/user/stats');
    revalidatePath('/api/user/subjects');

    return NextResponse.json({ profile });
}
