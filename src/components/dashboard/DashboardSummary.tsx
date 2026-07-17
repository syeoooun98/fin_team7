import { SEAT_STATUS_STYLE } from "@/lib/constants";
import type { DashboardSummary as DashboardSummaryData } from "@/lib/types";
import { ZoneOccupancyBar } from "./ZoneOccupancyBar";

/** design.md 4.8 — 홈 대시보드. PRD 9.3절 데이터 항목을 그대로 시각화한다. */
export function DashboardSummary({ data }: { data: DashboardSummaryData }) {
  const stats = [
    { key: "available", label: SEAT_STATUS_STYLE.AVAILABLE.label, value: data.available, color: SEAT_STATUS_STYLE.AVAILABLE.border },
    { key: "occupied", label: SEAT_STATUS_STYLE.OCCUPIED.label, value: data.occupied, color: SEAT_STATUS_STYLE.OCCUPIED.border },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">홈 대시보드</h1>
        <p className="text-xs text-neutral-400">{data.updatedAt} 기준 갱신</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.key} className="rounded-xl border border-neutral-200 p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-sm text-neutral-500">{stat.label}</p>
            <p className="text-xs text-neutral-400">
              {data.total > 0 ? Math.round((stat.value / data.total) * 100) : 0}%
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-neutral-400">외출 중 {data.awayCount}석 (선택적 노출, 9.3)</p>

      <div className="space-y-4">
        {data.byZone.map((zone) => (
          <ZoneOccupancyBar key={zone.zoneCode} summary={zone} />
        ))}
      </div>
    </div>
  );
}
