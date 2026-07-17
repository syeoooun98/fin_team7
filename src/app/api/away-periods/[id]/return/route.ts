import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

/** POST /api/away-periods/[id]/return — 자리비움 정상 복귀 (PRD 시나리오 2) */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const awayPeriod = await prisma.awayPeriod.findUnique({
    where: { id: Number(id) },
    include: { seatSession: true },
  });

  if (!awayPeriod || awayPeriod.seatSession.userId !== userId || awayPeriod.endedAt) {
    return NextResponse.json({ message: "복귀 처리할 수 있는 자리비움이 아닙니다." }, { status: 404 });
  }

  await prisma.awayPeriod.update({
    where: { id: awayPeriod.id },
    data: { endedAt: new Date(), endReason: "RETURNED" },
  });

  return NextResponse.json({ ok: true });
}
