import { IsometricBuildingMap } from "@/components/map/IsometricBuildingMap";
import { buildMockDashboardSummary } from "@/lib/mock-data";

/** design.md 4.1 — 3D 아이소메트릭 도서관 맵(건물 전체 뷰). TODO: 목업 대신 실시간 집계 데이터 연결 */
export default function MapPage() {
  const { byZone } = buildMockDashboardSummary();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">좌석 맵</h1>
      <IsometricBuildingMap zones={byZone} />
    </div>
  );
}
