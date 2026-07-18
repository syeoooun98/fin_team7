import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

/**
 * POST /api/seat-sessions/[id]/return-from-report — F11: 신고당한 좌석의 "자리 복귀".
 * "자리에 앉아서 책과 함께" 인증샷 미션 완료가 조건 — body에 /api/verification-photos가
 * 돌려준 photoPath가 없으면 신고를 해제해주지 않는다(사진 없이 버튼만 누르는 우회 방지).
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { photoPath?: string } | null;
  const photoPath = body?.photoPath;
  if (!photoPath) {
    return NextResponse.json({ message: "인증샷 업로드가 필요합니다." }, { status: 400 });
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
      data: { status: "CANCELLED_RETURN", resolvedAt: new Date(), photoPath },
    });
    if (activeReport.reporterUserId) {
      await tx.notification.create({
        data: {
          userId: activeReport.reporterUserId,
          type: "REPORT_CANCELLED",
          reportId: activeReport.id,
          message: "신고된 좌석은 자리 복귀 처리되었습니다!",
        },
      });
    }
  });

  return NextResponse.json({ ok: true, reportId: activeReport.id });
}
