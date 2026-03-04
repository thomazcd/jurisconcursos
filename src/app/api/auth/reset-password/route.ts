import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const { token, newPassword } = await req.json();

        if (!token || !newPassword) {
            return NextResponse.json({ error: 'Token e nova senha são obrigatórios' }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: 'A nova senha deve ter pelo menos 6 caracteres' }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpires: { gt: new Date() }, // O token deve ser maior que AGORA
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Atualizar senha e invalidar o token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash: hashedPassword,
                resetToken: null,
                resetTokenExpires: null,
            },
        });

        return NextResponse.json({ success: true, message: 'Senha redefinida com sucesso!' });
    } catch (err: any) {
        console.error('ERRO em /api/auth/reset-password:', err);
        return NextResponse.json({ error: 'Erro interno ao redefinir senha' }, { status: 500 });
    }
}
