import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

/**
 * POST /api/reports — 무단 점유 신고 접수 (PRD F9~F14)
 * 응답 형태는 { accepted, message }로 고정한다 — 프론트 ReportConfirmModal이 이 계약대로
 * accepted:false일 때 모달 안에 message를 그대로 표시한다(F13, design.md 4.6/5절).
 * 중복 신고 방지는 DB 부분 유니크 인덱스(ux_reports_active_session)가 보장한다.
 */
export async function POST(request: Request) {
  const reporterUserId = await getSessionUserId();
  if (!reporterUserId) {
    return NextResponse.json({ accepted: false, message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { seatSessionId } = await request.json();
  const session = await prisma.seatSession.findUnique({ where: { id: Number(seatSessionId) } });
  if (!session || session.checkedOutAt) {
    return NextResponse.json(
      { accepted: false, message: "신고할 수 있는 좌석이 아닙니다." },
      { status: 404 },
    );
  }
  if (session.userId === reporterUserId) {
    return NextResponse.json({ accepted: false, message: "본인 좌석은 신고할 수 없습니다." }, { status: 400 });
  }

  const reportedAt = new Date();
  const countdownEndsAt = new Date(reportedAt.getTime() + 60 * 60_000);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.report.create({
        data: { seatSessionId: session.id, reporterUserId, reportedAt, countdownEndsAt },
      });
      await tx.notification.create({
        data: {
          userId: session.userId,
          type: "REPORT_RECEIVED",
          seatSessionId: session.id,
          message: "누군가 이 좌석의 장시간 부재를 신고했습니다. 60분 내 복귀하지 않으면 자동 반납됩니다.",
        },
      });
    });

    return NextResponse.json({ accepted: true, message: "신고가 접수되었습니다." }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ accepted: false, message: "이미 신고가 접수되어 처리 중인 좌석입니다." });
    }
    throw error;
  }
}
