import { IsometricBuildingMap } from "@/components/map/IsometricBuildingMap";
import { getDashboardSummary } from "@/lib/dashboard";

/** design.md 4.1 — 3D 아이소메트릭 도서관 맵(건물 전체 뷰) */
export default async function MapPage() {
  const { byZone } = await getDashboardSummary();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">좌석 맵</h1>
      <IsometricBuildingMap zones={byZone} />
    </div>
  );
}
