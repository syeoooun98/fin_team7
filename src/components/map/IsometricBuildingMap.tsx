"use client";

import { useMemo, useState } from "react";
import { FloorView } from "./FloorView";
import type { DashboardZoneSummary } from "@/lib/types";

/**
 * design.md 4.1 — 3D 아이소메트릭 도서관 맵(건물 전체 뷰)의 자리표시자.
 * TODO: 실제 3D/아이소메트릭 일러스트 에셋은 design.md 9절 오픈 이슈 1번 결정 후 교체.
 * 지금은 층 탭 + 층별 구역 카드로 동일한 정보 구조(건물 → 층 → 구역)를 먼저 동작시킨다.
 */
export function IsometricBuildingMap({ zones }: { zones: DashboardZoneSummary[] }) {
  const floors = useMemo(
    () => Array.from(new Set(zones.map((z) => z.floor))).sort((a, b) => a - b),
    [zones],
  );
  const [selectedFloor, setSelectedFloor] = useState(floors[0] ?? 1);

  const zonesOnFloor = zones.filter((z) => z.floor === selectedFloor);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {floors.map((floor) => (
          <button
            key={floor}
            onClick={() => setSelectedFloor(floor)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              selectedFloor === floor
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {floor}F
          </button>
        ))}
      </div>
      <FloorView zones={zonesOnFloor} />
    </div>
  );
}
