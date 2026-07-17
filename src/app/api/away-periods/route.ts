import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { getAwayCooldown } from "@/lib/seat-status";

/**
 * POST /api/away-periods — 자리비움 신청 (PRD F5~F8, 10.2/10.4)
 * 동시 신청 방지는 DB 부분 유니크 인덱스(ux_away_periods_active_session)가 보장한다.
 */
export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { seatSessionId, categoryCode } = await request.json();

  const session = await prisma.seatSession.findUnique({ where: { id: Number(seatSessionId) } });
  if (!session || session.userId !== userId || session.checkedOutAt) {
    return NextResponse.json({ message: "본인의 활성 세션이 아닙니다." }, { status: 404 });
  }

  // F8/10.4 — 이용자 단위 쿨다운 (DB.md 2.6절 가정: 세션이 아니라 이용자 기준)
  const lastEnded = await prisma.awayPeriod.findFirst({
    where: { seatSession: { userId }, endedAt: { not: null } },
    orderBy: { endedAt: "desc" },
  });
  const cooldown = getAwayCooldown(lastEnded?.endedAt ?? null);
  if (cooldown.active) {
    const remainingMinutes = Math.ceil(cooldown.remainingSeconds / 60);
    return NextResponse.json(
      {
        message: `자리 비움은 이전 이용 종료 후 30분이 지나야 재신청할 수 있습니다 (${remainingMinutes}분 남음)`,
      },
      { status: 409 },
    );
  }

  const category = await prisma.awayCategory.findUnique({ where: { code: categoryCode } });
  if (!category || !category.active) {
    return NextResponse.json({ message: "존재하지 않는 카테고리입니다." }, { status: 400 });
  }

  try {
    const awayPeriod = await prisma.$transaction(async (tx) => {
      const created = await tx.awayPeriod.create({
        data: {
          seatSessionId: session.id,
          categoryCode: category.code,
          limitMinutes: category.limitMinutes,
        },
      });
      await tx.notification.create({
        data: {
          userId,
          type: "AWAY_STARTED",
          seatSessionId: session.id,
          message: `${category.label}(${category.limitMinutes}분) 자리비움을 시작했습니다.`,
        },
      });
      return created;
    });

    return NextResponse.json(awayPeriod, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "이미 진행 중인 자리비움이 있습니다." }, { status: 409 });
    }
    throw error;
  }
}
