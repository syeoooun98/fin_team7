import { SEAT_STATUS_STYLE } from "@/lib/constants";
import type { DashboardSummary as DashboardSummaryData, DashboardZoneSummary } from "@/lib/types";
import { FloorZoneGroup } from "./FloorZoneGroup";

/** 구역 9개 → 24개 확장에 대응: 층(floor) 오름차순으로 묶어 아코디언 그룹 배열을 만든다. */
function groupZonesByFloor(byZone: DashboardZoneSummary[]) {
  const zonesByFloor = new Map<number, DashboardZoneSummary[]>();
  for (const zone of byZone) {
    const list = zonesByFloor.get(zone.floor) ?? [];
    list.push(zone);
    zonesByFloor.set(zone.floor, list);
  }
  return Array.from(zonesByFloor.entries())
    .sort(([floorA], [floorB]) => floorA - floorB)
    .map(([floor, zones]) => ({ floor, zones }));
}

/** design.md 4.8 — 홈 대시보드. PRD 9.3절 데이터 항목을 그대로 시각화한다. */
export function DashboardSummary({ data }: { data: DashboardSummaryData }) {
  const stats = [
    {
      key: "available",
      label: SEAT_STATUS_STYLE.AVAILABLE.label,
      value: data.available,
      bg: SEAT_STATUS_STYLE.AVAILABLE.bg,
      color: SEAT_STATUS_STYLE.AVAILABLE.border,
    },
    {
      key: "empty",
      label: SEAT_STATUS_STYLE.EMPTY.label,
      value: data.empty,
      bg: SEAT_STATUS_STYLE.EMPTY.bg,
      color: SEAT_STATUS_STYLE.EMPTY.border,
    },
    {
      key: "occupied",
      label: SEAT_STATUS_STYLE.OCCUPIED.label,
      value: data.occupied,
      bg: SEAT_STATUS_STYLE.OCCUPIED.bg,
      color: SEAT_STATUS_STYLE.OCCUPIED.border,
    },
  ];

  const floorGroups = groupZonesByFloor(data.byZone);
  const firstFloor = floorGroups[0]?.floor;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">Live Status</p>
          <h1 className="text-2xl font-bold text-foreground">홈 대시보드</h1>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-white px-3 py-1 text-xs font-medium text-foreground-muted shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <span className="h-1.5 w-1.5 rounded-full bg-seat-available-border" />
          {data.updatedAt} 기준 갱신
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border-subtle bg-white p-5 shadow-[var(--shadow-card)]">
          <p className="text-sm font-medium text-foreground-muted">전체 좌석</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-foreground">{data.total}</p>
          <p className="mt-1 text-xs text-foreground-subtle">외출 중 {data.awayCount}석 (선택적 노출, 9.3)</p>
        </div>

        {stats.map((stat) => (
          <div
            key={stat.key}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-white p-5 shadow-[var(--shadow-card)]"
          >
            <div>
              <p className="text-sm font-medium text-foreground-muted">{stat.label}</p>
              <p className="mt-1 text-3xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="mt-0.5 text-xs text-foreground-subtle">
                {data.total > 0 ? Math.round((stat.value / data.total) * 100) : 0}%
              </p>
            </div>
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold"
              style={{ backgroundColor: stat.bg, color: stat.color }}
              aria-hidden
            >
              ●
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted">
            구역별 현황
          </h2>
          <span className="text-xs text-foreground-subtle">층 이름을 눌러 펼치거나 접어보세요</span>
        </div>

        {floorGroups.length === 0 ? (
          <p className="rounded-2xl border border-border-subtle bg-white p-6 text-center text-sm text-foreground-subtle">
            표시할 구역 데이터가 없습니다.
          </p>
        ) : (
          <div className="space-y-3">
            {floorGroups.map((group) => (
              <FloorZoneGroup
                key={group.floor}
                floor={group.floor}
                zones={group.zones}
                defaultOpen={group.floor === firstFloor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
