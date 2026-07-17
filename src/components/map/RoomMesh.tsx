"use client";

import { Edges, RoundedBox } from "@react-three/drei";
import type { FloorPlanBlock } from "@/lib/floor-plans";
import { FLOOR_CORNER_RADIUS, FLOOR_THICKNESS, computeRoomGeometry } from "./floor-geometry";

/**
 * 방 하나(구역 블록)의 바닥만 그린다.
 * - 바닥: 화이트 톤 재질 + 둥근 모서리(RoundedBox)로 부드러운 볼륨감을 준다.
 * - 조닝 구분은 면 채색 대신 파스텔 네온 색의 얇은 엣지 라인(Edges)으로 표현해
 *   화이트 톤을 유지하면서도 구역을 또렷이 구분한다.
 * 벽은 방마다 따로 그리지 않는다 — 층 전체 경계선을 한 번에 병합해서 그리는
 * <FloorWalls>가 층(Scene) 레벨에서 한 겹만 그린다(회색으로 겹쳐 보이는 문제 방지).
 */
export function RoomMesh({
  block,
  color,
  interactive,
}: {
  block: FloorPlanBlock;
  color: string;
  interactive: boolean;
}) {
  const geo = computeRoomGeometry(block);

  const floorRadius = Math.max(
    0.01,
    Math.min(FLOOR_CORNER_RADIUS, FLOOR_THICKNESS / 2 - 0.005, geo.floorWidth / 2 - 0.02, geo.floorDepth / 2 - 0.02)
  );

  return (
    <RoundedBox
      args={[geo.floorWidth, FLOOR_THICKNESS, geo.floorDepth]}
      radius={floorRadius}
      smoothness={3}
      position={[geo.centerX, FLOOR_THICKNESS / 2, geo.centerZ]}
    >
      <meshStandardMaterial color="#FFFFFF" roughness={0.85} metalness={0.02} />
      <Edges color={color} lineWidth={interactive ? 2.2 : 1} threshold={20} />
    </RoundedBox>
  );
}
