// 자리지킴이 — 마이페이지 배지/칭호 정의 + 평가 로직
// 한 번 획득하면 조건을 더 이상 만족하지 못해도 유지되는 "업적"이다(user_badges 테이블에 upsert).
//
// 임계값 출처:
// - 50시간, 5분, 3번(바람과 함께 사라지다)은 사용자가 직접 명시한 값 그대로.
// - PRECISE_RETURN_MASTER_MIN_COUNT / JUSTICE_SHERIFF_MIN_COUNT(각 3회)는 "누적 몇 번이어야
//   칭호를 줄 만큼 의미 있는가"에 대한 PM 가정치다 — 실측 없이 정한 값이라 파일럿 후 조정 대상.
import { prisma } from "@/lib/db";
import type { BadgeCode, BadgeStatus } from "@/lib/types";

const LIBRARY_REGULAR_MIN_MINUTES = 50 * 60; // 50시간
const PRECISE_RETURN_BUFFER_MINUTES = 5;
const PRECISE_RETURN_MASTER_MIN_COUNT = 3; // 가정치 — 실측 필요
const JUSTICE_SHERIFF_MIN_COUNT = 3; // 가정치 — 실측 필요
const GONE_WITH_THE_WIND_COUNT = 3;

interface BadgeDefinition {
  code: BadgeCode;
  title: string;
  description: string;
  icon: string;
  dishonor: boolean;
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    code: "LIBRARY_REGULAR",
    title: "도서관 터줏대감",
    description: "한 달 동안 자동반납이나 경고 없이 최소 50시간 집중했어요.",
    icon: "📚",
    dishonor: false,
  },
  {
    code: "PRECISE_RETURN_MASTER",
    title: "칼복귀 마스터",
    description: "자리비움 제한시간보다 5분 이상 남기고 칼같이 복귀한 게 3번 이상이에요.",
    icon: "🗡️",
    dishonor: false,
  },
  {
    code: "JUSTICE_SHERIFF",
    title: "정의의 보안관",
    description: "실제로 비어 있던 좌석을 신고해 회전율을 높인 적중 신고가 3번 이상이에요.",
    icon: "🤠",
    dishonor: false,
  },
  {
    code: "GONE_WITH_THE_WIND",
    title: "바람과 함께 사라지다",
    description: "자리비움 신청 없이 신고당해 자동반납된 적이 3번이에요.",
    icon: "🐇💨",
    dishonor: true,
  },
];

/** /api/seats 등에서 좌석 점유자의 장착 배지를 아이콘/제목만으로 표시할 때 쓰는 조회용 맵 (DB 조회 없이 상수). */
export const BADGE_DISPLAY_BY_CODE: Record<BadgeCode, { icon: string; title: string }> = Object.fromEntries(
  BADGE_DEFINITIONS.map((def) => [def.code, { icon: def.icon, title: def.title }]),
) as Record<BadgeCode, { icon: string; title: string }>;

function currentMonthLabel(now: Date): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * 배지 장착/해제. badgeCode가 null이면 해제. null이 아니면 본인이 실제로 획득한 배지인지
 * 검증한 뒤에만 저장한다(아직 못 딴 배지를 억지로 장착하는 것 방지).
 */
export async function equipBadge(userId: number, badgeCode: BadgeCode | null): Promise<{ ok: boolean; message?: string }> {
  if (badgeCode === null) {
    await prisma.user.update({ where: { id: userId }, data: { equippedBadgeCode: null } });
    return { ok: true };
  }

  const owned = await prisma.userBadge.findFirst({ where: { userId, badgeCode } });
  if (!owned) {
    return { ok: false, message: "아직 획득하지 않은 배지는 장착할 수 없어요." };
  }

  await prisma.user.update({ where: { id: userId }, data: { equippedBadgeCode: badgeCode } });
  return { ok: true };
}

/** 도서관 터줏대감 — 이번 달, 세션이 checked_in_at 기준 이번 달에 시작한 것만 집계(월 경계 걸친 세션은 근사치). */
async function checkLibraryRegular(userId: number, now: Date): Promise<boolean> {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

  const sessions = await prisma.seatSession.findMany({
    where: { userId, checkedInAt: { gte: monthStart }, checkedOutAt: { not: null } },
    include: { awayPeriods: true },
  });

  const hadAutoExpire = sessions.some(
    (s) => s.checkoutReason === "AWAY_EXPIRED" || s.checkoutReason === "REPORT_EXPIRED",
  );
  if (hadAutoExpire) return false;

  const warningCount = await prisma.notification.count({
    where: { userId, createdAt: { gte: monthStart }, type: { in: ["AWAY_WARNING", "REPORT_WARNING"] } },
  });
  if (warningCount > 0) return false;

  let focusedMinutes = 0;
  for (const session of sessions) {
    const sessionMinutes = (session.checkedOutAt!.getTime() - session.checkedInAt.getTime()) / 60_000;
    const awayMinutes = session.awayPeriods.reduce((sum, a) => {
      if (!a.endedAt) return sum;
      return sum + (a.endedAt.getTime() - a.startedAt.getTime()) / 60_000;
    }, 0);
    focusedMinutes += sessionMinutes - awayMinutes;
  }

  return focusedMinutes >= LIBRARY_REGULAR_MIN_MINUTES;
}

/** 칼복귀 마스터 — 전체 기간 누적. RETURNED로 끝난 자리비움 중 5분 이상 남기고 복귀한 횟수. */
async function checkPreciseReturnMaster(userId: number): Promise<boolean> {
  const returnedPeriods = await prisma.awayPeriod.findMany({
    where: { seatSession: { userId }, endReason: "RETURNED", endedAt: { not: null } },
  });

  const preciseCount = returnedPeriods.filter((period) => {
    const usedMinutes = (period.endedAt!.getTime() - period.startedAt.getTime()) / 60_000;
    const remainingMinutes = period.limitMinutes - usedMinutes;
    return remainingMinutes >= PRECISE_RETURN_BUFFER_MINUTES;
  }).length;

  return preciseCount >= PRECISE_RETURN_MASTER_MIN_COUNT;
}

/** 정의의 보안관 — 전체 기간 누적. 내가 신고한 건 중 실제로 회수(AUTO_EXPIRED/CHECKED_OUT)로 끝난 횟수. */
async function checkJusticeSheriff(userId: number): Promise<boolean> {
  const successfulReports = await prisma.report.count({
    where: { reporterUserId: userId, status: { in: ["AUTO_EXPIRED", "CHECKED_OUT"] } },
  });
  return successfulReports >= JUSTICE_SHERIFF_MIN_COUNT;
}

/** 바람과 함께 사라지다 — 전체 기간 누적. 자리비움 신청 없이(REPORT_EXPIRED) 자동반납된 횟수. */
async function checkGoneWithTheWind(userId: number): Promise<boolean> {
  const count = await prisma.seatSession.count({ where: { userId, checkoutReason: "REPORT_EXPIRED" } });
  return count >= GONE_WITH_THE_WIND_COUNT;
}

/** 조건을 새로 충족한 배지를 upsert로 부여하고, 4종 전체 상태(획득 여부 포함)를 반환한다. */
export async function evaluateAndGetBadges(userId: number): Promise<BadgeStatus[]> {
  const now = new Date();

  const [isLibraryRegular, isPreciseReturnMaster, isJusticeSheriff, isGoneWithTheWind] = await Promise.all([
    checkLibraryRegular(userId, now),
    checkPreciseReturnMaster(userId),
    checkJusticeSheriff(userId),
    checkGoneWithTheWind(userId),
  ]);

  const toAward: { badgeCode: BadgeCode; periodLabel: string }[] = [];
  if (isLibraryRegular) toAward.push({ badgeCode: "LIBRARY_REGULAR", periodLabel: currentMonthLabel(now) });
  if (isPreciseReturnMaster) toAward.push({ badgeCode: "PRECISE_RETURN_MASTER", periodLabel: "ALL_TIME" });
  if (isJusticeSheriff) toAward.push({ badgeCode: "JUSTICE_SHERIFF", periodLabel: "ALL_TIME" });
  if (isGoneWithTheWind) toAward.push({ badgeCode: "GONE_WITH_THE_WIND", periodLabel: "ALL_TIME" });

  for (const { badgeCode, periodLabel } of toAward) {
    await prisma.userBadge.upsert({
      where: { userId_badgeCode_periodLabel: { userId, badgeCode, periodLabel } },
      update: {},
      create: { userId, badgeCode, periodLabel },
    });
  }

  const earnedBadges = await prisma.userBadge.findMany({ where: { userId }, orderBy: { awardedAt: "asc" } });

  const earnedByCode = new Map<BadgeCode, Date>();
  for (const badge of earnedBadges) {
    const code = badge.badgeCode as BadgeCode;
    if (!earnedByCode.has(code)) earnedByCode.set(code, badge.awardedAt);
  }

  return BADGE_DEFINITIONS.map((def) => ({
    ...def,
    earned: earnedByCode.has(def.code),
    awardedAt: earnedByCode.get(def.code)?.toISOString() ?? null,
  }));
}
