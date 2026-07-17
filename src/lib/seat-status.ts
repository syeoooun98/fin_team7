// 자리지킴이 — 좌석/자리비움/신고 상태 파생 로직
// PRD 10.3(경고 공식)/10.4(쿨다운)의 계산 규칙을 그대로 구현한다.
import { AWAY_COOLDOWN_MINUTES, WARNING_THRESHOLD_RATIO } from "./constants";

const MINUTE_MS = 60_000;

export function remainingSeconds(target: Date, now: Date = new Date()): number {
  return Math.max(0, Math.round((target.getTime() - now.getTime()) / 1000));
}

/**
 * PRD 10.3 — "잔여시간이 전체 허용시간의 20%" 도달 여부.
 * startedAt + limitMinutes가 만료 시각, 그 시점 기준 잔여 비율이 20% 이하면 true.
 */
export function isWarningThresholdReached(
  startedAt: Date,
  limitMinutes: number,
  now: Date = new Date(),
): boolean {
  const totalMs = limitMinutes * MINUTE_MS;
  const elapsedMs = now.getTime() - startedAt.getTime();
  const remainingRatio = 1 - elapsedMs / totalMs;
  return remainingRatio <= WARNING_THRESHOLD_RATIO;
}

/**
 * PRD F8/10.4 — 자리비움 쿨다운. 마지막으로 종료된 자리비움 시각(이용자 단위, DB.md 2.6절 가정)을
 * 기준으로 30분이 지나지 않았으면 재신청을 막는다.
 */
export function getAwayCooldown(
  lastAwayEndedAt: Date | null,
  now: Date = new Date(),
): { active: boolean; remainingSeconds: number } {
  if (!lastAwayEndedAt) return { active: false, remainingSeconds: 0 };
  const cooldownEndsAt = new Date(lastAwayEndedAt.getTime() + AWAY_COOLDOWN_MINUTES * MINUTE_MS);
  const remaining = remainingSeconds(cooldownEndsAt, now);
  return { active: remaining > 0, remainingSeconds: remaining };
}
