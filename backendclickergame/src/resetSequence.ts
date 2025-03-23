import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetUserSequence() {
    try {
        // Reset the User ID sequence to start from 1
        await prisma.$executeRawUnsafe(`ALTER SEQUENCE "User_id_seq" RESTART WITH 1;`);
        console.log("User ID sequence reset successfully.");
    } catch (error) {
        console.error("Error resetting sequence:", error);
    } finally {
        await prisma.$disconnect();
    }
}

resetUserSequence();
