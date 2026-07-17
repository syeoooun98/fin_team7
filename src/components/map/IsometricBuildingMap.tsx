"use client";

import { useState } from "react";
import { IsometricFloorPlan } from "./IsometricFloorPlan";
import type { DashboardZoneSummary } from "@/lib/types";

const FLOORS = [2, 3, 4, 5];

/** design.md 4.1 — 3D 아이소메트릭 도서관 맵(건물 전체 뷰). 층 탭 + 층별 3D 구조도. */
export function IsometricBuildingMap({ zones }: { zones: DashboardZoneSummary[] }) {
  const [selectedFloor, setSelectedFloor] = useState(FLOORS[0]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {FLOORS.map((floor) => (
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
      {/* key로 층 전환 시 Canvas/카메라를 새로 마운트해 이전 층의 시점 상태가 남지 않게 한다. */}
      <IsometricFloorPlan key={selectedFloor} floor={selectedFloor} zoneSummaries={zones} />
    </div>
  );
}
