import { ZoneBlock } from "./ZoneBlock";
import type { DashboardZoneSummary } from "@/lib/types";

/** design.md 4.2 — 특정 층의 구역 카드 목록 */
export function FloorView({ zones }: { zones: DashboardZoneSummary[] }) {
  if (zones.length === 0) {
    return <p className="text-sm text-neutral-500">이 층에는 구역이 없습니다.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {zones.map((zone) => (
        <ZoneBlock key={zone.zoneCode} summary={zone} />
      ))}
    </div>
  );
}
