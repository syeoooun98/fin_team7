import { Button } from "@/components/ui/Button";
import { SEMANTIC_COLORS, WARNING_THRESHOLD_RATIO } from "@/lib/constants";

function formatMinutesSeconds(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** design.md 4.5 — 자리비움 진행 중 카운트다운(원형 프로그레스 + 타이머). 잔여 20% 도달 시 경고색 전환(10.3). */
export function AwayCountdown({
  categoryLabel,
  limitMinutes,
  remainingSeconds,
  onReturn,
}: {
  categoryLabel: string;
  limitMinutes: number;
  remainingSeconds: number;
  onReturn: () => void;
}) {
  const totalSeconds = limitMinutes * 60;
  const remainingRatio = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const isWarning = remainingRatio <= WARNING_THRESHOLD_RATIO;
  const progressPercent = Math.round(remainingRatio * 100);
  const ringColor = isWarning ? SEMANTIC_COLORS.warnAmber : SEMANTIC_COLORS.selfRing;

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-neutral-200 p-4">
      <p className="text-sm text-neutral-500">{categoryLabel} · 자리비움 진행 중</p>
      <div
        className="relative flex h-24 w-24 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(${ringColor} ${progressPercent}%, #e5e7eb 0)`,
        }}
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-lg font-semibold">
          {formatMinutesSeconds(remainingSeconds)}
        </div>
      </div>
      {isWarning && (
        <p className="text-xs font-medium" style={{ color: SEMANTIC_COLORS.warnAmber }}>
          곧 자동 반납됩니다
        </p>
      )}
      <Button variant="secondary" onClick={onReturn}>
        지금 복귀
      </Button>
    </div>
  );
}
