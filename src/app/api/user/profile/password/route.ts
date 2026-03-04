import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/guards';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const schema = z.object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres'),
});

export async function POST(req: NextRequest) {
    const { error, session } = await requireAuth(['USER', 'ADMIN', 'GESTOR']);
    if (error) return error;

    try {
        const body = await req.json();
        const parsed = schema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({
                error: 'Dados inválidos',
                details: parsed.error.flatten()
            }, { status: 400 });
        }

        const { currentPassword, newPassword } = parsed.data;
        const userId = (session!.user as any).id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { passwordHash: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            return NextResponse.json({ error: 'A senha atual está incorreta' }, { status: 400 });
        }

        const newHashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newHashedPassword }
        });

        return NextResponse.json({ success: true, message: 'Senha alterada com sucesso' });
    } catch (err: any) {
        console.error('Erro ao alterar senha:', err);
        return NextResponse.json({ error: 'Erro interno ao processar a solicitação' }, { status: 500 });
    }
}
