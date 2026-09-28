import { PrismaClient } from "@prisma/client";

// Prevents creating a new database connection every time Next.js hot-reloads
// during development. In production, there is only one connection.
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = db;
}
