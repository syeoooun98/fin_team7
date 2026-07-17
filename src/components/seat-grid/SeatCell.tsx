import { AWAY_BADGE_STYLE, SEAT_STATUS_STYLE, SEMANTIC_COLORS } from "@/lib/constants";
import type { PublicSeatView } from "@/lib/types";

/**
 * design.md 4.3 — 좌석 그리드 셀 하나.
 * 색만으로 상태를 구분하지 않는다는 원칙(design.md 1절)에 따라 라벨 텍스트를 항상 함께 렌더링한다.
 * 주의: 이 컴포넌트는 PublicSeatView만 받는다 — 외출 카테고리/잔여시간, 신고 여부는
 * 애초에 이 타입에 없으므로(F7/F9/F13) 실수로 노출할 방법이 없다.
 */
export function SeatCell({ seat, onClick }: { seat: PublicSeatView; onClick: () => void }) {
  const style = SEAT_STATUS_STYLE[seat.status];
  const seatNumberLabel = seat.seatCode.split("-").pop();

  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center justify-center gap-0.5 rounded-lg border p-2 text-xs transition hover:opacity-80"
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
        outline: seat.isMine ? `2px solid ${SEMANTIC_COLORS.selfRing}` : undefined,
        outlineOffset: seat.isMine ? "2px" : undefined,
      }}
    >
      <span className="font-semibold" style={{ color: style.border }}>
        {seatNumberLabel}
      </span>
      <span className="text-[10px] text-neutral-600">{style.label}</span>
      {seat.isAway && (
        <span
          className="absolute -top-2 rounded-full border px-1.5 text-[10px]"
          style={{ backgroundColor: AWAY_BADGE_STYLE.bg, borderColor: AWAY_BADGE_STYLE.border }}
        >
          {AWAY_BADGE_STYLE.label}
        </span>
      )}
    </button>
  );
}
