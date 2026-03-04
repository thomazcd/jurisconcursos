import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    try {
        const users = await prisma.user.findMany({ select: { id: true, email: true, failedLoginAttempts: true, lockedUntil: true }})
        console.log(users)
    } catch (e) {
        console.error("Erro Prisma:", e)
    } finally {
        await prisma.$disconnect()
    }
}
main()
