import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

/**
 * GET /api/me/active-report — 로그인 사용자가 현재 점유 중인 좌석에 활성 신고가 걸려있는지 확인.
 * ReportGateModal이 주기적으로 폴링해 "자리 복귀를 인증하세요" 팝업을 띄울지 판단하는 데 쓴다.
 */
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ activeReport: null });
  }

  const report = await prisma.report.findFirst({
    where: { status: "ACTIVE", seatSession: { userId, checkedOutAt: null } },
    select: { id: true, seatSessionId: true },
  });

  return NextResponse.json({
    activeReport: report ? { reportId: report.id, seatSessionId: report.seatSessionId } : null,
  });
}
