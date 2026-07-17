import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** GET /api/zones — PRD 6.2 구역 목록 */
export async function GET() {
  const zones = await prisma.zone.findMany({ orderBy: { code: "asc" } });
  return NextResponse.json(zones);
}
