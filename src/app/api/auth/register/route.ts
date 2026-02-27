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
        const body = await req.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Dados inválidos', issues: parsed.error.issues }, { status: 400 });
        }
        const { name, email, password } = parsed.data;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role: 'USER',
                profile: { create: { activeTrack: 'JUIZ' } },
            },
            select: { id: true, name: true, email: true, role: true },
        });

        return NextResponse.json({ user }, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
