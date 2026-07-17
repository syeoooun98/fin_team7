import { SEAT_STATUS_STYLE, ZONE_COLORS } from "@/lib/constants";
import type { DashboardZoneSummary } from "@/lib/types";

/** design.md 4.8 — 구역 한 줄당 예약가능/빈자리/이용중 3색 스택 바 */
export function ZoneOccupancyBar({ summary }: { summary: DashboardZoneSummary }) {
  const { total, available, empty, occupied, zoneName, zoneCode, floor } = summary;
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);
  const zoneColor = ZONE_COLORS[zoneCode]?.hex ?? "#8A93A6";

  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border-subtle bg-surface-soft/60 p-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <span
        className="h-8 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: zoneColor }}
        aria-hidden
      />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-xs">
          <span className="truncate font-semibold text-foreground" title={`${zoneName} (${zoneCode})`}>
            {zoneName}{" "}
            <span className="font-normal text-foreground-subtle">
              {floor}F · {zoneCode}
            </span>
          </span>
          <span className="shrink-0 text-foreground-muted">
            {available + empty} / {total} 가능
          </span>
        </div>
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-white">
          <div style={{ width: `${pct(available)}%`, backgroundColor: SEAT_STATUS_STYLE.AVAILABLE.border }} />
          <div style={{ width: `${pct(empty)}%`, backgroundColor: SEAT_STATUS_STYLE.EMPTY.border }} />
          <div style={{ width: `${pct(occupied)}%`, backgroundColor: SEAT_STATUS_STYLE.OCCUPIED.border }} />
        </div>
      </div>
    </div>
  );
}
