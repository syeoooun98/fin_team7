import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { notifyCheckoutWatchers } from "@/lib/notify-watchers";

/** POST /api/seat-sessions/[id]/checkout — PRD F4 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const session = await prisma.seatSession.findUnique({
    where: { id: Number(id) },
    include: { seat: true },
  });
  if (!session || session.userId !== userId || session.checkedOutAt) {
    return NextResponse.json({ message: "체크아웃할 수 있는 세션이 아닙니다." }, { status: 404 });
  }

  const now = new Date();
  const activeReport = await prisma.report.findFirst({
    where: { seatSessionId: session.id, status: "ACTIVE" },
  });

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
      data: { status: "AVAILABLE", statusChangedAt: now },
    });
    await tx.notification.create({
      data: {
        userId,
        type: "CHECKOUT_COMPLETE",
        seatSessionId: session.id,
        message: "체크아웃이 완료되었습니다.",
      },
    });
    await notifyCheckoutWatchers(tx, session.id, session.seat.seatCode);

    // "자리 복귀를 인증하세요" 팝업에서 자리 복귀 대신 체크아웃을 선택한 경우 —
    // 활성 신고를 종결하고 신고자에게 익명 알림을 보낸다.
    if (activeReport) {
      await tx.report.update({
        where: { id: activeReport.id },
        data: { status: "CHECKED_OUT", resolvedAt: now },
      });
      if (activeReport.reporterUserId) {
        await tx.notification.create({
          data: {
            userId: activeReport.reporterUserId,
            type: "REPORT_CHECKED_OUT",
            reportId: activeReport.id,
            message: "신고된 좌석이 체크아웃되었습니다!",
          },
        });
      }
    }
  });

  return NextResponse.json({ ok: true });
}
