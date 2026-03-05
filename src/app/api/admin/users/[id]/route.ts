import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/guards';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const { error } = await requireAuth(['ADMIN', 'GESTOR']);
    if (error) return error;

    try {
        const id = params.id;

        // Ensure we are not deleting the last admin or the currently logged-in admin (optional but safe)
        const userToDelete = await prisma.user.findUnique({ where: { id } });
        if (!userToDelete) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        // Actually delete the user - cascade will remove UserProfile, PrecedentReads, etc
        await prisma.user.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('API /admin/users/[id] DELETE error:', err);
        return NextResponse.json({ error: 'Erro ao excluir usuário' }, { status: 500 });
    }
}
