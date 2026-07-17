import Link from "next/link";
import { ZONE_COLORS } from "@/lib/constants";
import type { DashboardZoneSummary } from "@/lib/types";

/** design.md 4.1/4.2 — 구역 하나를 나타내는 카드. 개별 좌석 색은 여기 표시하지 않고 집계 숫자만. */
export function ZoneBlock({ summary }: { summary: DashboardZoneSummary }) {
  const color = ZONE_COLORS[summary.zoneCode];

  return (
    <Link
      href={`/map/${summary.zoneCode}`}
      className="block rounded-xl border border-neutral-200 p-4 transition hover:shadow-md"
      style={{ backgroundColor: `${color.hex}1A`, borderColor: color.hex }}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold" style={{ color: color.hex }}>
          {summary.zoneName}
        </span>
        <span className="text-xs text-neutral-500">{summary.zoneCode}</span>
      </div>
      <p className="mt-2 text-sm text-neutral-700">
        예약가능 {summary.available} / 전체 {summary.total}
      </p>
    </Link>
  );
}
