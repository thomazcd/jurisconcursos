import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { MailService } from '@/services/MailService';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'O e-mail é obrigatório' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Por segurança, mesmo se o usuário não for achado, retornamos sucesso (evitar enumeração)
        if (!user) {
            return NextResponse.json({ success: true, message: 'Se o e-mail estiver cadastrado, um link de recuperação será enviado.' });
        }

        // Gerar token seguro (válido por 1 hora)
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hora a partir de agora

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken: token,
                resetTokenExpires: expires,
            },
        });

        // Enviar o e-mail
        try {
            await MailService.sendResetPasswordEmail(email, token);
        } catch (mailErr) {
            console.error('Falha ao enviar e-mail de recuperação:', mailErr);
            // Se falhar o envio, podemos avisar o usuário que houve erro no servidor
            return NextResponse.json({ error: 'Erro ao enviar e-mail de recuperação. Tente novamente mais tarde.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'O link de recuperação de senha foi enviado para o seu e-mail.' });
    } catch (err: any) {
        console.error('ERRO em /api/auth/forgot-password:', err);
        return NextResponse.json({ error: 'Houve um erro interno no processamento' }, { status: 500 });
    }
}
