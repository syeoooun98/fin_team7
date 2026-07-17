"use client";

import { SEMANTIC_COLORS, WARNING_THRESHOLD_RATIO } from "@/lib/constants";
import { useRemainingSeconds } from "@/lib/useRemainingSeconds";

function formatMinutesSeconds(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * 지금 진행 중인 자리비움을 보여주는 작은 원형 진행률 표시 — 통계 도넛(AwayStatsDonut) 오른쪽에
 * 나란히 띄우는 용도. 실제 복귀 조작은 MySeatCard의 AwayCountdown이 담당하므로 여기엔 버튼이 없다.
 */
export function LiveAwayMiniDonut({
  categoryLabel,
  limitMinutes,
  startedAt,
}: {
  categoryLabel: string;
  limitMinutes: number;
  startedAt: string;
}) {
  const remainingSeconds = useRemainingSeconds(startedAt, limitMinutes);
  const totalSeconds = limitMinutes * 60;
  const remainingRatio = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const isWarning = remainingRatio <= WARNING_THRESHOLD_RATIO;
  const progressPercent = Math.round(remainingRatio * 100);
  const ringColor = isWarning ? SEMANTIC_COLORS.warnAmber : SEMANTIC_COLORS.selfRing;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative flex h-14 w-14 items-center justify-center rounded-full"
        style={{ background: `conic-gradient(${ringColor} ${progressPercent}%, #e5e7eb 0)` }}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[11px] font-semibold">
          {formatMinutesSeconds(remainingSeconds)}
        </div>
      </div>
      <p className="text-center text-xs text-neutral-500">
        지금
        <br />
        {categoryLabel}
      </p>
    </div>
  );
}
