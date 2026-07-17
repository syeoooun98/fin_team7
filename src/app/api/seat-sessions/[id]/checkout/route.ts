import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

/** POST /api/seat-sessions/[id]/checkout — PRD F4 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const session = await prisma.seatSession.findUnique({ where: { id: Number(id) } });
  if (!session || session.userId !== userId || session.checkedOutAt) {
    return NextResponse.json({ message: "체크아웃할 수 있는 세션이 아닙니다." }, { status: 404 });
  }

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    // 외출 중 그대로 체크아웃하는 예외 케이스 (DB.md 2.6절 end_reason SESSION_CHECKOUT)
    await tx.awayPeriod.updateMany({
      where: { seatSessionId: session.id, endedAt: null },
      data: { endedAt: now, endReason: "SESSION_CHECKOUT" },
    });
    await tx.seatSession.update({
      where: { id: session.id },
      data: { checkedOutAt: now, checkoutReason: "MANUAL" },
    });
    await tx.seat.update({
      where: { id: session.seatId },
      data: { status: "EMPTY", statusChangedAt: now },
    });
    await tx.notification.create({
      data: {
        userId,
        type: "CHECKOUT_COMPLETE",
        seatSessionId: session.id,
        message: "체크아웃이 완료되었습니다.",
      },
    });
  });

  return NextResponse.json({ ok: true });
}
