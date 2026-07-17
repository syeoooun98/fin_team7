import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** GET /api/away-categories — PRD F5, 10.1/10.2 코드 테이블 조회 */
export async function GET() {
  const categories = await prisma.awayCategory.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(categories);
}
