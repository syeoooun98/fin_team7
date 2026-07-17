import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isWarningThresholdReached } from "@/lib/seat-status";

/**
 * GET /api/cron/auto-expire — PRD F6(자리비움 자동반납)/F12(신고 자동반납)/10.3(20% 경고)를
 * 실제로 집행하는 배치 엔드포인트. Next.js 라우트 핸들러 자체는 스케줄링 기능이 없으므로
 * Vercel Cron(또는 동등한 스케줄러)이 주기적으로 이 경로를 호출해야 한다 — vercel.json 참고.
 *
 * 실시간성 요구사항(PRD 9.2)의 목표 SLA가 TBD이므로 호출 주기(현재 1분)는 잠정치다.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();
  let awayExpired = 0;
  let awayWarned = 0;
  let reportExpired = 0;
  let reportWarned = 0;

  // --- F6: 자리비움 자동반납 ---
  const activeAwayPeriods = await prisma.awayPeriod.findMany({
    where: { endedAt: null },
    include: { seatSession: true },
  });

  for (const away of activeAwayPeriods) {
    const deadline = new Date(away.startedAt.getTime() + away.limitMinutes * 60_000);

    if (now >= deadline) {
      await prisma.$transaction(async (tx) => {
        await tx.awayPeriod.update({
          where: { id: away.id },
          data: { endedAt: now, endReason: "AUTO_EXPIRED" },
        });
        await tx.seatSession.update({
          where: { id: away.seatSessionId },
          data: { checkedOutAt: now, checkoutReason: "AWAY_EXPIRED" },
        });
        await tx.seat.update({
          where: { id: away.seatSession.seatId },
          data: { status: "EMPTY", statusChangedAt: now },
        });
        await tx.notification.create({
          data: {
            userId: away.seatSession.userId,
            type: "AWAY_AUTO_EXPIRED",
            seatSessionId: away.seatSessionId,
            message:
              "자리비움 제한시간이 지나 자동 반납되었습니다. 소지품은 시스템이 관리하지 않으니 직접 회수하거나 도서관 분실물 보관소로 문의하세요. (14.7)",
          },
        });
      });
      awayExpired++;
    } else if (!away.warningSentAt && isWarningThresholdReached(away.startedAt, away.limitMinutes, now)) {
      await prisma.$transaction(async (tx) => {
        await tx.awayPeriod.update({ where: { id: away.id }, data: { warningSentAt: now } });
        await tx.notification.create({
          data: {
            userId: away.seatSession.userId,
            type: "AWAY_WARNING",
            seatSessionId: away.seatSessionId,
            message: "자리비움 잔여시간이 얼마 남지 않았습니다. 곧 자동 반납됩니다.",
          },
        });
      });
      awayWarned++;
    }
  }

  // --- F12: 신고로 인한 자동반납 ---
  const activeReports = await prisma.report.findMany({
    where: { status: "ACTIVE" },
    include: { seatSession: true },
  });

  for (const report of activeReports) {
    if (now >= report.countdownEndsAt) {
      await prisma.$transaction(async (tx) => {
        await tx.report.update({
          where: { id: report.id },
          data: { status: "AUTO_EXPIRED", resolvedAt: now },
        });
        await tx.seatSession.update({
          where: { id: report.seatSessionId },
          data: { checkedOutAt: now, checkoutReason: "REPORT_EXPIRED" },
        });
        await tx.seat.update({
          where: { id: report.seatSession.seatId },
          data: { status: "EMPTY", statusChangedAt: now },
        });
        await tx.notification.create({
          data: {
            userId: report.seatSession.userId,
            type: "REPORT_AUTO_EXPIRED_OCCUPANT",
            reportId: report.id,
            message:
              "신고로 인해 좌석이 자동 반납되었습니다. 소지품은 시스템이 관리하지 않으니 직접 회수하거나 도서관 분실물 보관소로 문의하세요. (14.7)",
          },
        });
        if (report.reporterUserId) {
          await tx.notification.create({
            data: {
              userId: report.reporterUserId,
              type: "REPORT_AUTO_EXPIRED_REPORTER",
              reportId: report.id,
              message: "신고하신 좌석이 반납되어 이용 가능합니다.",
            },
          });
        }
      });
      reportExpired++;
    } else if (
      !report.warningSentAt &&
      isWarningThresholdReached(report.reportedAt, 60, now)
    ) {
      await prisma.$transaction(async (tx) => {
        await tx.report.update({ where: { id: report.id }, data: { warningSentAt: now } });
        await tx.notification.create({
          data: {
            userId: report.seatSession.userId,
            type: "REPORT_WARNING",
            reportId: report.id,
            message: "신고 카운트다운 잔여시간이 얼마 남지 않았습니다. 곧 자동 반납됩니다.",
          },
        });
      });
      reportWarned++;
    }
  }

  return NextResponse.json({ awayExpired, awayWarned, reportExpired, reportWarned });
}
