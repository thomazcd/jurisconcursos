import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const VALID_TRACKS = ['JUIZ_ESTADUAL', 'JUIZ_FEDERAL', 'PROCURADOR'] as const;

const schema = z.object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    password: z.string().min(6),
    track: z.enum(VALID_TRACKS).optional().default('JUIZ_ESTADUAL'),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = schema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.message }, { status: 400 });
        }

        const { name, email, password, track } = parsed.data;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: 'Este e-mail já está cadastrado' }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { name, email, passwordHash, role: 'USER' },
        });

        await prisma.userProfile.create({
            data: { userId: user.id, activeTrack: track },
        });

        return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Erro ao criar conta', details: error.message, code: error.code }, { status: 500 });
    }
}
