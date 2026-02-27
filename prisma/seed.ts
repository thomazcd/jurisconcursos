import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seed: apenas usuários de teste...');

    const adminHash = await bcrypt.hash('admin123', 12);
    const userHash = await bcrypt.hash('user123', 12);

    await prisma.user.upsert({
        where: { email: 'admin@juris.com' },
        update: {},
        create: {
            name: 'Administrador',
            email: 'admin@juris.com',
            passwordHash: adminHash,
            role: Role.ADMIN,
            profile: { create: { activeTrack: 'JUIZ_ESTADUAL' } },
        },
    });

    await prisma.user.upsert({
        where: { email: 'gestor@juris.com' },
        update: {},
        create: {
            name: 'Gestor de Conteúdo',
            email: 'gestor@juris.com',
            passwordHash: adminHash,
            role: Role.GESTOR,
            profile: { create: { activeTrack: 'JUIZ_ESTADUAL' } },
        },
    });

    await prisma.user.upsert({
        where: { email: 'juiz@juris.com' },
        update: {},
        create: {
            name: 'Carlos Magistrado',
            email: 'juiz@juris.com',
            passwordHash: userHash,
            role: Role.USER,
            profile: { create: { activeTrack: 'JUIZ_ESTADUAL' } },
        },
    });

    await prisma.user.upsert({
        where: { email: 'procurador@juris.com' },
        update: {},
        create: {
            name: 'Ana Procuradora',
            email: 'procurador@juris.com',
            passwordHash: userHash,
            role: Role.USER,
            profile: { create: { activeTrack: 'PROCURADOR' } },
        },
    });

    console.log('✅ Seed concluído! Matérias e precedentes devem ser inseridos via SQL no Supabase.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
