import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

/**
 * POST /api/seat-sessions — 체크인 (PRD F3, 2.3: 현장 QR 스캔 후 이 엔드포인트가 호출된다고 가정)
 * 동시 체크인 방지는 이 라우트 코드가 아니라 DB의 부분 유니크 인덱스가 보장한다
 * (prisma/partial_unique_indexes.sql — ux_seat_sessions_active_seat, ux_seat_sessions_active_user).
 * 여기서는 그 제약 위반(P2002)을 잡아 사용자에게 보여줄 메시지로만 변환한다.
 */
export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { seatCode } = await request.json();
  const seat = await prisma.seat.findUnique({ where: { seatCode } });
  if (!seat) {
    return NextResponse.json({ message: "존재하지 않는 좌석입니다." }, { status: 404 });
  }

  try {
    const session = await prisma.$transaction(async (tx) => {
      const created = await tx.seatSession.create({ data: { seatId: seat.id, userId } });
      await tx.seat.update({
        where: { id: seat.id },
        data: { status: "OCCUPIED", statusChangedAt: new Date() },
      });
      await tx.notification.create({
        data: {
          userId,
          type: "CHECKIN_COMPLETE",
          seatSessionId: created.id,
          message: `${seat.seatCode} 좌석에 체크인했습니다.`,
        },
      });
      return created;
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { message: "이미 이용 중인 좌석이거나, 이미 다른 좌석을 이용 중입니다 (F3)." },
        { status: 409 },
      );
    }
    throw error;
  }
}
