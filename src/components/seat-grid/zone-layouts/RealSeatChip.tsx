"use client";

import { MOCKUP2_COLORS } from "@/app/_seatmap-mockups/SeatChip";
import { SEMANTIC_COLORS } from "@/lib/constants";
import type { PublicSeatView } from "@/lib/types";

function resolveStyle(seat: PublicSeatView) {
  if (seat.isAway) return { ...MOCKUP2_COLORS.AWAY, label: "이용중(외출중)", icon: true };
  if (seat.status === "OCCUPIED") return { ...MOCKUP2_COLORS.OCCUPIED, label: "이용중", icon: false };
  return { ...MOCKUP2_COLORS.AVAILABLE, label: "예약 가능", icon: false };
}

/**
 * 좌석디자인1.png 목업의 SeatChip을 실제 PublicSeatView로 그리는 버전.
 * seat가 없으면(해당 번호에 아직 DB 좌석이 없음) 클릭 불가능한 점선 자리표시자를 그린다.
 */
export function RealSeatChip({
  no,
  seat,
  onClick,
}: {
  no: number;
  seat?: PublicSeatView;
  onClick?: () => void;
}) {
  if (!seat) {
    return (
      <span className="flex h-7 w-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-200 text-[11px] font-semibold text-gray-300">
        {no}
      </span>
    );
  }

  const style = resolveStyle(seat);
  const isOccupied = seat.status !== "AVAILABLE";

  return (
    <button
      onClick={onClick}
      title={`${seat.seatCode} · ${style.label}`}
      className="relative flex h-7 w-10 shrink-0 items-center justify-center gap-0.5 rounded-lg border text-[11px] font-semibold shadow-sm transition hover:-translate-y-0.5"
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
        color: style.text,
        outline: seat.isMine ? `2px solid ${SEMANTIC_COLORS.selfRing}` : undefined,
        outlineOffset: seat.isMine ? "1px" : undefined,
      }}
    >
      {style.icon && <span className="text-[10px] leading-none">🚶</span>}
      {no}
      {isOccupied && (
        <span
          className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: style.text }}
        />
      )}
    </button>
  );
}
