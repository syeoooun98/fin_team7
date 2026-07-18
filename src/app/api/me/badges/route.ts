import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { evaluateAndGetBadges } from "@/lib/badges";
import { prisma } from "@/lib/db";

/** GET /api/me/badges — 마이페이지 배지/칭호. 호출 시점에 새로 조건을 충족한 배지를 평가·부여한다. */
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const [badges, user] = await Promise.all([
    evaluateAndGetBadges(userId),
    prisma.user.findUnique({ where: { id: userId }, select: { equippedBadgeCode: true } }),
  ]);

  return NextResponse.json({ badges, equippedBadgeCode: user?.equippedBadgeCode ?? null });
}
