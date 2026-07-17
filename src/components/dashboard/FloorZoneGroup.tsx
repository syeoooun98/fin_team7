import type { DashboardZoneSummary } from "@/lib/types";
import { ZoneOccupancyBar } from "./ZoneOccupancyBar";

interface FloorZoneGroupProps {
  floor: number;
  zones: DashboardZoneSummary[];
  /** 첫 진입 시 열려 있을지 여부. 나머지 층은 접힌 채로 시작해 스크롤 길이를 줄인다. */
  defaultOpen?: boolean;
}

/**
 * design.md 4.8 확장 — 구역이 9개 → 24개로 늘어나며 세로 나열이 너무 길어져,
 * 층(2F~5F) 단위 아코디언(<details>/<summary>)으로 묶어 정보 밀도를 개선한다.
 * 네이티브 details 요소를 사용해 별도 클라이언트 상태 없이 접기/펼치기를 지원한다.
 */
export function FloorZoneGroup({ floor, zones, defaultOpen = false }: FloorZoneGroupProps) {
  const total = zones.reduce((sum, z) => sum + z.total, 0);
  const free = zones.reduce((sum, z) => sum + z.available, 0);

  return (
    <details
      className="group overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-[var(--shadow-card)] [&_summary::-webkit-details-marker]:hidden"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none select-none items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand">
            {floor}F
          </span>
          <span className="truncate text-sm font-semibold text-foreground">
            {floor}층{" "}
            <span className="font-normal text-foreground-subtle">{zones.length}개 구역</span>
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden text-xs font-medium text-foreground-muted sm:inline">
            이용 가능 {free} / {total}
          </span>
          <svg
            className="h-4 w-4 shrink-0 text-foreground-subtle transition-transform duration-200 group-open:rotate-180"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </summary>
      <div className="grid grid-cols-1 gap-2.5 border-t border-border-subtle px-4 py-4 sm:grid-cols-2 sm:px-5">
        {zones.map((zone) => (
          <ZoneOccupancyBar key={zone.zoneCode} summary={zone} />
        ))}
      </div>
    </details>
  );
}
