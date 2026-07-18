import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import type { AwayDailyStats } from "@/lib/types";

const DAYS_TO_SHOW = 7;

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

/**
 * GET /api/me/away-daily — 마이페이지 일별 자리비움 선그래프(design.md 4.7). 최근 7일(오늘 포함)
 * 고정 — 기록 없는 날도 0분으로 채워 항상 7개 점을 반환한다.
 */
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const today = new Date();
  const rangeStart = new Date(startOfDay(today));
  rangeStart.setDate(rangeStart.getDate() - (DAYS_TO_SHOW - 1));

  const awayPeriods = await prisma.awayPeriod.findMany({
    where: {
      seatSession: { userId },
      startedAt: { gte: rangeStart },
      endedAt: { not: null },
    },
    select: { startedAt: true, endedAt: true },
  });

  const minutesByDate = new Map<string, number>();
  for (const period of awayPeriods) {
    const key = toDateKey(period.startedAt);
    const minutes = (period.endedAt!.getTime() - period.startedAt.getTime()) / 60_000;
    minutesByDate.set(key, (minutesByDate.get(key) ?? 0) + minutes);
  }

  const days = Array.from({ length: DAYS_TO_SHOW }, (_, i) => {
    const d = new Date(rangeStart);
    d.setDate(rangeStart.getDate() + i);
    const key = toDateKey(d);
    return { date: key, totalMinutes: Math.round(minutesByDate.get(key) ?? 0) };
  });

  const stats: AwayDailyStats = { days };
  return NextResponse.json(stats);
}
