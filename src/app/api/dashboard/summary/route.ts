import { NextResponse } from "next/server";
import { getDashboardSummary } from "@/lib/dashboard";

/** GET /api/dashboard/summary — PRD F15, 9.3 홈 대시보드 집계 */
export async function GET() {
  return NextResponse.json(await getDashboardSummary());
}
