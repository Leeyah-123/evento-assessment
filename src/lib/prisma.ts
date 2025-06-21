import { PrismaClient } from '@/generated/prisma';

let prisma: PrismaClient;

// Prevent multiple instances of Prisma in development
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!(global as unknown as { prisma: PrismaClient }).prisma) {
    (global as unknown as { prisma: PrismaClient }).prisma = new PrismaClient();
  }
  prisma = (global as unknown as { prisma: PrismaClient }).prisma;
}

export default prisma;
