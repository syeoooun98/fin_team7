import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

/**
 * POST /api/seat-sessions/[id]/watch — "체크아웃 시 알림" 신청 (F22, DB.md 2.9절)
 * 응답 형태는 { accepted, message }로 report와 동일 계약을 따른다.
 * 중복 신청은 @@unique(seat_session_id, watcher_user_id)에 기대는 대신, 존재 여부를
 * 먼저 조회해 idempotent하게 처리한다(이미 신청돼 있어도 accepted:true로 응답).
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const watcherUserId = await getSessionUserId();
  if (!watcherUserId) {
    return NextResponse.json({ accepted: false, message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const session = await prisma.seatSession.findUnique({
    where: { id: Number(id) },
    include: { seat: true },
  });
  if (!session || session.checkedOutAt) {
    return NextResponse.json(
      { accepted: false, message: "알림을 신청할 수 있는 좌석이 아닙니다." },
      { status: 404 },
    );
  }
  if (session.userId === watcherUserId) {
    return NextResponse.json({ accepted: false, message: "본인 좌석은 신청할 수 없습니다." }, { status: 400 });
  }

  const existing = await prisma.seatWatchRequest.findUnique({
    where: { seatSessionId_watcherUserId: { seatSessionId: session.id, watcherUserId } },
  });
  if (existing) {
    return NextResponse.json({ accepted: true, message: "이미 신청된 좌석입니다." });
  }

  await prisma.seatWatchRequest.create({
    data: { seatSessionId: session.id, watcherUserId },
  });

  return NextResponse.json(
    { accepted: true, message: `${session.seat.seatCode} 좌석이 체크아웃되면 알림을 보내드릴게요.` },
    { status: 201 },
  );
}
