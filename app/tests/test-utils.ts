import prisma from "@/app/lib/db";

export async function clearDatabase() {
    const tablenames = await prisma.$queryRawUnsafe<{ tablename: string }[]>(
        `SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname='public'`
    );

    for (const { tablename } of tablenames) {
        if (tablename !== '_prisma_migrations') {
            await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
        }
    }
}

export async function resetDatabaseWithUser() {
    await clearDatabase();

    await prisma.user.create({
        data: {
            name: 'Test User Name',
            email: 'test@example.com',
        }
    });
}