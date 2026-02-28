import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    const pCount = await prisma.precedent.count()
    const uCount = await prisma.user.count()
    const sCount = await prisma.subject.count()
    console.log({ precedents: pCount, users: uCount, subjects: sCount })
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
