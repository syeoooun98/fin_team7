import { SEAT_STATUS_STYLE } from "@/lib/constants";
import type { DashboardZoneSummary } from "@/lib/types";

/** design.md 4.8 — 구역 한 줄당 예약가능/이용중 2색 스택 바 */
export function ZoneOccupancyBar({ summary }: { summary: DashboardZoneSummary }) {
  const { total, available, occupied, zoneName, zoneCode } = summary;
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          {zoneName} <span className="text-neutral-400">({zoneCode})</span>
        </span>
        <span className="text-neutral-500">
          {available} / {total} 이용 가능
        </span>
      </div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
        <div style={{ width: `${pct(available)}%`, backgroundColor: SEAT_STATUS_STYLE.AVAILABLE.border }} />
        <div style={{ width: `${pct(occupied)}%`, backgroundColor: SEAT_STATUS_STYLE.OCCUPIED.border }} />
      </div>
    </div>
  );
}
