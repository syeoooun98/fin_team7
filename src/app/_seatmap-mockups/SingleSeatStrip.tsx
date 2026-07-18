import type { SingleColumn } from "./types";
import { SeatChip, type SeatColorScheme } from "./SeatChip";

const FURNITURE_BG = {
  white: "border-[1.5px] border-[#B7B7C2] bg-white",
  tan: "border-[1.5px] border-[#D8B983] bg-[#F6ECDA]",
} as const;

/** 단일 좌석이 한 줄로 이어지는 벽면 부착 좌석줄 (세로 또는 가로). */
export function SingleSeatStrip({
  seats,
  direction = "vertical",
  furniture = "white",
  scheme = "mockup2",
}: {
  seats: SingleColumn;
  direction?: "vertical" | "horizontal";
  furniture?: keyof typeof FURNITURE_BG;
  scheme?: SeatColorScheme;
}) {
  return (
    <div
      className={`flex gap-1.5 rounded-full px-1.5 py-1.5 shadow-sm ${FURNITURE_BG[furniture]} ${
        direction === "vertical" ? "flex-col" : "flex-row"
      }`}
    >
      {seats.map((s) => (
        <SeatChip key={s.no} seat={s} scheme={scheme} />
      ))}
    </div>
  );
}
