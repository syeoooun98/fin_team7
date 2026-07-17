import { IsometricBuildingMap } from "@/components/map/IsometricBuildingMap";
import { buildMockDashboardSummary } from "@/lib/mock-data";

/** design.md 4.1 — 3D 아이소메트릭 도서관 맵(건물 전체 뷰). TODO: 목업 대신 실시간 집계 데이터 연결 */
export default function MapPage() {
  const { byZone } = buildMockDashboardSummary();
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">Library Map</p>
        <h1 className="text-2xl font-bold text-foreground">좌석 맵</h1>
      </div>
      <div className="rounded-2xl border border-border-subtle bg-white p-4 shadow-[var(--shadow-card)] sm:p-6">
        <IsometricBuildingMap zones={byZone} />
      </div>
    </div>
  );
}
