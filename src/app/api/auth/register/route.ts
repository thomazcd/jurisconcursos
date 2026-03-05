import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const VALID_TRACKS = ['JUIZ_ESTADUAL', 'JUIZ_FEDERAL', 'PROCURADOR', 'TODAS'] as const;

const schema = z.object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    password: z.string().min(6),
    track: z.enum(VALID_TRACKS).optional().default('JUIZ_ESTADUAL'),
    phone: z.string().optional(),
    submitTime: z.number().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'registration_open' }
        });
        const isRegistrationOpen = setting ? setting.value === 'true' : true;
        if (!isRegistrationOpen) {
            return NextResponse.json({ error: 'Cadastro de novos alunos temporariamente desabilitado.' }, { status: 403 });
        }

        const body = await req.json();
        const parsed = schema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.message }, { status: 400 });
        }

        const { name, email, password, track, phone, submitTime } = parsed.data;

        // Anti-bot honeypot check
        if (phone || (submitTime !== undefined && submitTime < 2000)) {
            console.warn(`Bot signup attempt blocked: ${email}`);
            return NextResponse.json({ error: 'Bot detected' }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: 'Este e-mail já está cadastrado' }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const [user, profile] = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: { name, email, passwordHash, role: 'USER' },
            });
            const newProfile = await tx.userProfile.create({
                data: { userId: newUser.id, activeTrack: track },
            });
            return [newUser, newProfile];
        });

        return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Erro ao criar conta' }, { status: 500 });
    }
}
