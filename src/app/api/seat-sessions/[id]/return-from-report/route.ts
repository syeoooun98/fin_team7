import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

/** POST /api/seat-sessions/[id]/return-from-report — F11: 신고당한 좌석의 "자리 복귀" */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const session = await prisma.seatSession.findUnique({ where: { id: Number(id) } });
  if (!session || session.userId !== userId) {
    return NextResponse.json({ message: "본인의 세션이 아닙니다." }, { status: 404 });
  }

  const activeReport = await prisma.report.findFirst({
    where: { seatSessionId: session.id, status: "ACTIVE" },
  });
  if (!activeReport) {
    return NextResponse.json({ message: "진행 중인 신고가 없습니다." }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.report.update({
      where: { id: activeReport.id },
      data: { status: "CANCELLED_RETURN", resolvedAt: new Date() },
    });
    if (activeReport.reporterUserId) {
      await tx.notification.create({
        data: {
          userId: activeReport.reporterUserId,
          type: "REPORT_CANCELLED",
          reportId: activeReport.id,
          message: "신고하신 좌석에 이용자가 복귀하여 자리가 비지 않습니다.",
        },
      });
    }
  });

  return NextResponse.json({ ok: true });
}
