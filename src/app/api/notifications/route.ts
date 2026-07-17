import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

/** GET /api/notifications — PRD F16, design.md 4.7/5절 알림 목록 */
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { seatSession: { include: { seat: true } } },
  });

  // seatCode는 SEAT_WATCH_AVAILABLE 알림의 "바로 이용하기" 액션이 어느 좌석을 체크인할지
  // 판단하는 데 쓴다(F22) — 좌석/세션 원본 관계 객체까지 클라이언트에 그대로 내려주지 않는다.
  const shaped = notifications.map(({ seatSession, ...n }) => ({
    ...n,
    seatCode: seatSession?.seat.seatCode ?? null,
  }));

  return NextResponse.json(shaped);
}
