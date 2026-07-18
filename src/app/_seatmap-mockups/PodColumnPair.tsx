import type { PodSlot } from "./types";
import { SeatChip, type SeatColorScheme } from "./SeatChip";

const FURNITURE_BG = {
  white: "border-[1.5px] border-[#B7B7C2] bg-white",
  tan: "border-[1.5px] border-[#D8B983] bg-[#F6ECDA]",
} as const;

/** 좌우 한 쌍씩 앉는 책상(pill) 열. 위/아래 두 블록이 별도의 알약 모양으로 붙어 하나의 열을 이룬다. */
export function PodColumnPair({
  pod,
  furniture = "white",
  scheme = "mockup2",
}: {
  pod: PodSlot;
  furniture?: keyof typeof FURNITURE_BG;
  scheme?: SeatColorScheme;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      {pod.top.length > 0 && (
        <div className={`flex flex-col gap-1.5 rounded-full px-1.5 py-2 shadow-sm ${FURNITURE_BG[furniture]}`}>
          {pod.top.map((row, i) => (
            <div key={i} className="flex items-center gap-3">
              <SeatChip seat={row.left} scheme={scheme} />
              <SeatChip seat={row.right} scheme={scheme} />
            </div>
          ))}
        </div>
      )}
      {pod.bottom.length > 0 && (
        <div className={`flex flex-col gap-1.5 rounded-full px-1.5 py-2 shadow-sm ${FURNITURE_BG[furniture]}`}>
          {pod.bottom.map((row, i) => (
            <div key={i} className="flex items-center gap-3">
              <SeatChip seat={row.left} scheme={scheme} />
              <SeatChip seat={row.right} scheme={scheme} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
