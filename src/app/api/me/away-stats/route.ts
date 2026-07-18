import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import type { AwayCategoryCode, AwayStats, AwayStatsCategory } from "@/lib/types";

function getRangeStart(range: "week" | "month", now: Date): Date {
  if (range === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  }
  // 이번 주 월요일 0시(ISO 주 시작). getDay(): 0=일 ~ 6=토
  const day = now.getDay();
  const diffToMonday = (day + 6) % 7;
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday, 0, 0, 0, 0);
}

/**
 * GET /api/me/away-stats?range=week|month — 마이페이지 외출 태그별 통계 도넛(주/월).
 * 완료된(endedAt IS NOT NULL) 자리비움만 집계한다 — 지금 진행 중인 건은 별도의 실시간
 * 미니 도넛(design.md 4.7)으로 보여주고 여기서는 중복 집계하지 않는다.
 */
export async function GET(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const rangeParam = new URL(request.url).searchParams.get("range");
  const range: "week" | "month" = rangeParam === "month" ? "month" : "week";
  const now = new Date();
  const rangeStart = getRangeStart(range, now);

  const [categories, awayPeriods] = await Promise.all([
    prisma.awayCategory.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.awayPeriod.findMany({
      where: {
        seatSession: { userId },
        startedAt: { gte: rangeStart },
        endedAt: { not: null },
      },
      select: { categoryCode: true, startedAt: true, endedAt: true },
    }),
  ]);

  const totalsByCategory = new Map<string, { count: number; totalMinutes: number }>();
  for (const period of awayPeriods) {
    const entry = totalsByCategory.get(period.categoryCode) ?? { count: 0, totalMinutes: 0 };
    entry.count += 1;
    entry.totalMinutes += (period.endedAt!.getTime() - period.startedAt.getTime()) / 60_000;
    totalsByCategory.set(period.categoryCode, entry);
  }

  const result: AwayStatsCategory[] = categories.map((category) => {
    const totals = totalsByCategory.get(category.code) ?? { count: 0, totalMinutes: 0 };
    return {
      code: category.code as AwayCategoryCode,
      label: category.label,
      count: totals.count,
      totalMinutes: Math.round(totals.totalMinutes),
    };
  });

  const stats: AwayStats = { range, rangeStart: rangeStart.toISOString(), categories: result };
  return NextResponse.json(stats);
}
