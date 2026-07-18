import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { getAwayCooldown, remainingSeconds } from "@/lib/seat-status";
import { BADGE_DISPLAY_BY_CODE } from "@/lib/badges";
import type { AwayCategoryCode, OwnSeatDetail, ZoneCode } from "@/lib/types";

/**
 * GET /api/me/seat — 마이페이지(design.md 4.7)가 쓰는 "내 현재 좌석" 상세.
 * 체크인한 좌석이 없으면 { seat: null }.
 */
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const session = await prisma.seatSession.findFirst({
    where: { userId, checkedOutAt: null },
    include: {
      seat: true,
      awayPeriods: { where: { endedAt: null }, take: 1, include: { category: true } },
      reports: { where: { status: "ACTIVE" }, take: 1 },
      user: { select: { equippedBadgeCode: true } },
    },
  });

  if (!session) {
    return NextResponse.json({ seat: null });
  }

  const now = new Date();
  const activeAwayPeriod = session.awayPeriods[0];
  const activeReport = session.reports[0];

  const lastEnded = await prisma.awayPeriod.findFirst({
    where: { seatSession: { userId }, endedAt: { not: null } },
    orderBy: { endedAt: "desc" },
  });
  const cooldown = getAwayCooldown(lastEnded?.endedAt ?? null, now);
  const equippedCode = session.user.equippedBadgeCode;

  const seat: OwnSeatDetail = {
    id: session.seat.id,
    seatCode: session.seat.seatCode,
    zoneCode: session.seat.zoneCode as ZoneCode,
    roomNumber: session.seat.roomNumber,
    hasOutlet: session.seat.hasOutlet,
    isWindow: session.seat.isWindow,
    status: session.seat.status,
    isAway: Boolean(activeAwayPeriod),
    isMine: true,
    seatSessionId: session.id,
    occupantBadge: equippedCode ? { code: equippedCode, ...BADGE_DISPLAY_BY_CODE[equippedCode] } : null,
    activeAway: activeAwayPeriod
      ? {
          id: activeAwayPeriod.id,
          categoryCode: activeAwayPeriod.categoryCode as AwayCategoryCode,
          label: activeAwayPeriod.category.label,
          startedAt: activeAwayPeriod.startedAt.toISOString(),
          limitMinutes: activeAwayPeriod.limitMinutes,
          remainingSeconds: remainingSeconds(
            new Date(activeAwayPeriod.startedAt.getTime() + activeAwayPeriod.limitMinutes * 60_000),
            now,
          ),
        }
      : null,
    activeReport: activeReport
      ? {
          countdownEndsAt: activeReport.countdownEndsAt.toISOString(),
          remainingSeconds: remainingSeconds(activeReport.countdownEndsAt, now),
        }
      : null,
    awayCooldownRemainingSeconds: cooldown.remainingSeconds,
  };

  return NextResponse.json({ seat });
}
