import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { equipBadge } from "@/lib/badges";
import type { BadgeCode } from "@/lib/types";

/**
 * PATCH /api/me/badges/equip — 좌석 이용 중 남에게 보여줄 배지를 선택/해제.
 * body: { badgeCode: BadgeCode | null } (null이면 해제)
 */
export async function PATCH(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { badgeCode } = (await request.json()) as { badgeCode: BadgeCode | null };
  const result = await equipBadge(userId, badgeCode);
  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, equippedBadgeCode: badgeCode });
}
