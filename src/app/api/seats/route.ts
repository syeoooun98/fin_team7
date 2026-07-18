import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { getAwayCooldown, remainingSeconds } from "@/lib/seat-status";
import { BADGE_DISPLAY_BY_CODE } from "@/lib/badges";
import type { AwayCategoryCode, OwnSeatDetail, PublicSeatView, ZoneCode } from "@/lib/types";

type SeatResponseItem = PublicSeatView &
  Partial<Pick<OwnSeatDetail, "activeAway" | "activeReport" | "awayCooldownRemainingSeconds">>;

/**
 * GET /api/seats?zoneCode=CZ — design.md 4.3 좌석 그리드가 쓰는 좌석 목록.
 * 타인에게는 PublicSeatView 필드만 의미 있고(occupant 식별자, away 카테고리, 잔여시간, 신고
 * 여부는 애초에 계산하지 않음 — F7/F9/F14), 본인 점유 좌석(isMine)에는 액션에 필요한
 * activeAway/activeReport/awayCooldownRemainingSeconds를 추가로 채워 넣는다.
 */
export async function GET(request: Request) {
  const zoneCode = new URL(request.url).searchParams.get("zoneCode");
  if (!zoneCode) {
    return NextResponse.json({ message: "zoneCode 쿼리 파라미터가 필요합니다." }, { status: 400 });
  }

  const userId = await getSessionUserId();

  const seats = await prisma.seat.findMany({
    where: { zoneCode },
    orderBy: { seatCode: "asc" },
    include: {
      seatSessions: {
        where: { checkedOutAt: null },
        take: 1,
        include: {
          awayPeriods: { where: { endedAt: null }, take: 1, include: { category: true } },
          reports: { where: { status: "ACTIVE" }, take: 1 },
          user: { select: { equippedBadgeCode: true } },
        },
      },
    },
  });

  const now = new Date();
  let cooldownRemaining = 0;
  if (userId) {
    const lastEnded = await prisma.awayPeriod.findFirst({
      where: { seatSession: { userId }, endedAt: { not: null } },
      orderBy: { endedAt: "desc" },
    });
    cooldownRemaining = getAwayCooldown(lastEnded?.endedAt ?? null, now).remainingSeconds;
  }

  const result: SeatResponseItem[] = seats.map((seat) => {
    const activeSession = seat.seatSessions[0];
    const isMine = activeSession?.userId === userId;
    const activeAwayPeriod = activeSession?.awayPeriods[0];
    const activeReport = activeSession?.reports[0];
    const equippedCode = activeSession?.user.equippedBadgeCode;

    const base: PublicSeatView = {
      id: seat.id,
      seatCode: seat.seatCode,
      zoneCode: seat.zoneCode as ZoneCode,
      roomNumber: seat.roomNumber,
      hasOutlet: seat.hasOutlet,
      isWindow: seat.isWindow,
      status: seat.status,
      isAway: Boolean(activeAwayPeriod),
      isMine,
      seatSessionId: activeSession?.id ?? null,
      occupantBadge: equippedCode ? { code: equippedCode, ...BADGE_DISPLAY_BY_CODE[equippedCode] } : null,
    };

    if (!isMine) return base;

    return {
      ...base,
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
      awayCooldownRemainingSeconds: cooldownRemaining,
    };
  });

  return NextResponse.json(result);
}
