import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    password: z.string().min(6),
});

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: 'Este e-mail já está cadastrado' }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        // Criando usuário e perfil separadamente para evitar travamentos de transação em poolers
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role: 'USER',
            },
        });

        await prisma.userProfile.create({
            data: {
                userId: user.id,
                activeTrack: 'JUIZ',
            },
        });

        return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json({
            error: 'Erro ao criar conta',
            details: error.message,
            code: error.code
        }, { status: 500 });
    }
}
