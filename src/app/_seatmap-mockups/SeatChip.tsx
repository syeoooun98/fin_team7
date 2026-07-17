import { SEAT_STATUS_STYLE } from "@/lib/constants";
import type { MockSeat } from "./types";

export type SeatColorScheme = "mockup2" | "design";

/** mockup2.png 범례("예약 가능"=블루 / "이용중"=그레이 / "이용중(외출중)"=퍼플) 색상. */
const MOCKUP2_COLORS = {
  AVAILABLE: { bg: "#D8EAFB", border: "#8FC2EF", text: "#2E6DA4" },
  OCCUPIED: { bg: "#DCDCE1", border: "#B6B6BF", text: "#57565D" },
  AWAY: { bg: "#D9B8EE", border: "#A879C2", text: "#5B2A72" },
} as const;

function resolveStyle(state: MockSeat["state"], scheme: SeatColorScheme) {
  if (scheme === "design") {
    const s = state === "AVAILABLE" ? SEAT_STATUS_STYLE.AVAILABLE : SEAT_STATUS_STYLE.OCCUPIED;
    return { bg: s.bg, border: s.border, text: s.border, label: s.label, icon: false };
  }
  if (state === "AWAY") {
    return { ...MOCKUP2_COLORS.AWAY, label: "이용중(외출중)", icon: true };
  }
  const s = state === "OCCUPIED" ? MOCKUP2_COLORS.OCCUPIED : MOCKUP2_COLORS.AVAILABLE;
  return { ...s, label: state === "OCCUPIED" ? "이용중" : "예약 가능", icon: false };
}

/** 좌석 상태 칩. scheme="mockup2"(기본, 블루/그레이) 또는 "design"(민트/그레이, 2Fmain 전용). */
export function SeatChip({
  seat,
  scheme = "mockup2",
}: {
  seat: MockSeat;
  scheme?: SeatColorScheme;
}) {
  const style = resolveStyle(seat.state, scheme);
  const isOccupied = seat.state !== "AVAILABLE";
  return (
    <span
      className="relative flex h-6 w-9 shrink-0 items-center justify-center gap-0.5 rounded-lg border text-[11px] font-semibold shadow-sm"
      style={{ backgroundColor: style.bg, borderColor: style.border, color: style.text }}
      title={`${seat.no}번 · ${style.label}`}
    >
      {style.icon && <span className="text-[10px] leading-none">🚶</span>}
      {seat.no}
      {isOccupied && (
        <span
          className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: style.text }}
        />
      )}
    </span>
  );
}

export { MOCKUP2_COLORS };
