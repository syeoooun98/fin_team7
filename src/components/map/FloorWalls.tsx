"use client";

import { Edges, RoundedBox } from "@react-three/drei";
import type { FloorPlanBlock } from "@/lib/floor-plans";
import { FLOOR_THICKNESS, WALL_CORNER_RADIUS, WALL_HEIGHT, computeFloorWalls } from "./floor-geometry";

/**
 * 층 전체 벽을 한 번에 그린다(방마다 따로 그리지 않음).
 * computeFloorWalls가 맞닿은 방들의 경계선을 하나로 합쳐주므로, 방 사이 벽이 두 겹으로
 * 겹쳐 반투명 흰색이 진하게/회색으로 보이던 문제가 사라진다. 재질도 불투명에 가깝게 바꿔
 * (기존 opacity 0.55 → 0.96) 화이트 톤이 확실히 드러나게 한다.
 */
export function FloorWalls({ blocks }: { blocks: FloorPlanBlock[] }) {
  const walls = computeFloorWalls(blocks);

  return (
    <group>
      {walls.map((wall, i) => {
        const radius = Math.max(
          0.008,
          Math.min(WALL_CORNER_RADIUS, wall.sizeX / 2 - 0.02, wall.sizeZ / 2 - 0.02, WALL_HEIGHT / 2 - 0.05)
        );
        return (
          <RoundedBox
            key={i}
            args={[wall.sizeX, WALL_HEIGHT, wall.sizeZ]}
            radius={radius}
            smoothness={3}
            position={[wall.x, FLOOR_THICKNESS + WALL_HEIGHT / 2, wall.z]}
          >
            <meshStandardMaterial color="#FFFFFF" transparent opacity={0.96} roughness={0.6} metalness={0.02} />
            <Edges color="#E7E9F2" lineWidth={1} threshold={20} />
          </RoundedBox>
        );
      })}
    </group>
  );
}
