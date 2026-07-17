// Prisma client singleton — Next.js 개발 모드 HMR로 인한 커넥션 중복 생성을 방지하는 표준 패턴
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
