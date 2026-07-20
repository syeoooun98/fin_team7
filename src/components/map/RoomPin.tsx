"use client";

import Link from "next/link";
import { Html } from "@react-three/drei";
import type { FloorPlanBlock } from "@/lib/floor-plans";
import type { ZoneCode } from "@/lib/types";
import { MapPin } from "./MapPin";
import { FLOOR_THICKNESS, WALL_HEIGHT, computeRoomGeometry } from "./floor-geometry";

/**
 * 구역 핀 + 라벨. drei <Html>로 3D 좌표에 고정된 DOM 오버레이를 띄우고,
 * 그 안에 기존 Next.js <Link>를 그대로 사용해 클라이언트 라우팅을 유지한다.
 */
export function RoomPin({
  block,
  zoneCode,
  color,
  available,
}: {
  block: FloorPlanBlock;
  zoneCode: ZoneCode;
  color: string;
  available?: number;
}) {
  const geo = computeRoomGeometry(block);
  const y = FLOOR_THICKNESS + WALL_HEIGHT + 0.35;

  return (
    <Html position={[geo.centerX, y, geo.centerZ]} center zIndexRange={[10, 0]} occlude={false}>
      <Link
        href={`/map/${zoneCode}`}
        className="flex cursor-pointer select-none flex-col items-center gap-1 p-2"
        aria-label={`${block.label} 좌석 맵으로 이동`}
      >
        <MapPin color={color} available={available} />
        {block.label && (
          <span className="whitespace-nowrap rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-semibold text-neutral-700 shadow-sm">
            {block.label}
          </span>
        )}
      </Link>
    </Html>
  );
}
