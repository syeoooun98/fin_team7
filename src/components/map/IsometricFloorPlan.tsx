"use client";

import dynamic from "next/dynamic";
import type { DashboardZoneSummary } from "@/lib/types";

/**
 * design.md 4.1 — 층별 3D 구조도.
 * Three.js(WebGL)를 쓰는 <FloorScene>은 브라우저 전용이라 next/dynamic(ssr:false)으로 지연 로드하고,
 * 로딩 중에는 스피너 문구를 보여준다.
 */
const FloorScene = dynamic(() => import("./FloorScene").then((m) => m.FloorScene), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center gap-2 text-sm text-neutral-400">
      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-500" />
      3D 구조도를 불러오는 중...
    </div>
  ),
});

export function IsometricFloorPlan({
  floor,
  zoneSummaries,
}: {
  floor: number;
  zoneSummaries: DashboardZoneSummary[];
}) {
  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 sm:h-[560px]">
      <FloorScene floor={floor} zoneSummaries={zoneSummaries} />
      <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-white/70 px-2 py-0.5 text-[11px] text-neutral-400">
        드래그: 회전 · 휠: 확대·축소 · 우클릭 드래그: 이동 · 핀 클릭: 구역 좌석 맵으로 이동 (화장실·엘리베이터·비상구 아이콘은 위치 표시용)
      </p>
    </div>
  );
}
