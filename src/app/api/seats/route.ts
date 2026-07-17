import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { deriveDisplaySeatStatus } from "@/lib/seat-status";
import type { PublicSeatView, ZoneCode } from "@/lib/types";

/**
 * GET /api/seats?zoneCode=CZ — design.md 4.3 좌석 그리드가 쓰는 "타인 시점" 좌석 목록.
 * PublicSeatView에 없는 필드(occupant 식별자, away 카테고리, 잔여시간, 신고 여부)는
 * 여기서 애초에 계산·반환하지 않는다 — F7/F9/F14 익명성 요구사항(DB.md 5절 원칙).
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
        include: { awayPeriods: { where: { endedAt: null }, take: 1 } },
      },
    },
  });

  const now = new Date();
  const result: PublicSeatView[] = seats.map((seat) => {
    const activeSession = seat.seatSessions[0];
    return {
      id: seat.id,
      seatCode: seat.seatCode,
      zoneCode: seat.zoneCode as ZoneCode,
      roomNumber: seat.roomNumber,
      hasOutlet: seat.hasOutlet,
      isWindow: seat.isWindow,
      status: deriveDisplaySeatStatus(seat.status, seat.statusChangedAt, now),
      isAway: Boolean(activeSession?.awayPeriods.length),
      isMine: activeSession?.userId === userId,
    };
  });

  return NextResponse.json(result);
}
