"use client";

import { ContactShadows, OrbitControls, OrthographicCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { FACILITY_ICONS, FLOOR_PLANS } from "@/lib/floor-plans";
import { ZONE_COLORS } from "@/lib/constants";
import type { DashboardZoneSummary, ZoneCode } from "@/lib/types";
import { FOOTPRINT_DEPTH, FOOTPRINT_WIDTH } from "./floor-geometry";
import { FacilityPin } from "./FacilityPin";
import { FloorWalls } from "./FloorWalls";
import { RoomMesh } from "./RoomMesh";
import { RoomPin } from "./RoomPin";

/**
 * 실제로 좌석이 존재하는 4개 구역만 핀에 "이용 가능 좌석 수" 배지를 보여준다.
 * 나머지 20개 구역은 좌석이 아직 없는 위치 표시용 구역이라 핀 + 이름 라벨만 보여준다
 * (클릭 시 좌석 맵으로 이동하는 동작 자체는 20개 구역도 동일하게 유지).
 * 이름 문자열이 아니라 zoneCode 화이트리스트로 판단한다 — 예: F4CR(1인 연구 캐럴)는
 * 이름에 "열람실"이 없고 목록에도 없으므로 배지 없음.
 */
const SEAT_COUNT_ZONE_CODES: ReadonlySet<ZoneCode> = new Set(["F2F1", "F2SQ", "F4F2", "F4GR"]);

/**
 * design.md 4.1 — 층별 3D 아이소메트릭 구조도(Canvas 본체).
 * 화이트 톤 바닥/벽 + 둥근 모서리 볼륨 + 파스텔 네온 엣지 라인으로 구역(조닝)을 구분하고,
 * 물방울 핀(이용 가능 좌석 수 표시) 클릭 시 좌석 맵으로 이동한다.
 * 화장실/엘리베이터/비상구계단은 구역이 아닌 아이콘 핀으로만 표시한다(클릭 이동 없음).
 * WebGL을 다루므로 클라이언트 전용(부모에서 next/dynamic ssr:false로 로드).
 */
export function FloorScene({
  floor,
  zoneSummaries,
}: {
  floor: number;
  zoneSummaries: DashboardZoneSummary[];
}) {
  const blocks = FLOOR_PLANS[floor] ?? [];
  const zoneBlocks = blocks.filter((b) => b.zoneCode);
  const facilities = FACILITY_ICONS[floor] ?? [];
  const maxSpan = Math.max(FOOTPRINT_WIDTH, FOOTPRINT_DEPTH);

  return (
    <Canvas dpr={[1, 1.8]} gl={{ antialias: true }}>
      <color attach="background" args={["#FCFCFE"]} />
      {/* 벽/바닥이 회색으로 보이지 않도록 전체 조도를 넉넉히 확보(그림자 대신 은은한 채움광 위주) */}
      <ambientLight intensity={0.9} />
      <hemisphereLight args={["#ffffff", "#d7dae4", 0.6]} />
      <directionalLight
        position={[maxSpan * 0.6, maxSpan * 1.1, maxSpan * 0.5]}
        intensity={0.95}
      />

      <OrthographicCamera
        makeDefault
        position={[maxSpan * 0.95, maxSpan * 0.9, maxSpan * 0.95]}
        zoom={38}
        near={0.1}
        far={200}
      />
      <OrbitControls
        makeDefault
        target={[0, 1, 0]}
        enableDamping
        dampingFactor={0.12}
        minZoom={18}
        maxZoom={95}
        maxPolarAngle={Math.PI / 2.05}
        minPolarAngle={0.3}
      />

      {/* 대지 슬래브 */}
      <mesh position={[0, -0.07, 0]}>
        <boxGeometry args={[FOOTPRINT_WIDTH + 2.4, 0.12, FOOTPRINT_DEPTH + 2.4]} />
        <meshStandardMaterial color="#F7F8FB" roughness={1} />
      </mesh>

      {blocks.map((block) => {
        const color = block.zoneCode ? ZONE_COLORS[block.zoneCode].hex : "#CBCFDA";
        return <RoomMesh key={block.id} block={block} color={color} interactive={Boolean(block.zoneCode)} />;
      })}

      {/* 방마다 따로 그리지 않고 층 전체 경계선을 한 번만 그린다(공유 벽 dedupe) */}
      <FloorWalls blocks={blocks} />

      {zoneBlocks.map((block) => {
        const zoneCode = block.zoneCode!;
        const summary = zoneSummaries.find((z) => z.zoneCode === zoneCode);
        const available = SEAT_COUNT_ZONE_CODES.has(zoneCode) ? summary?.available : undefined;
        return (
          <RoomPin key={block.id} block={block} zoneCode={zoneCode} color={ZONE_COLORS[zoneCode].hex} available={available} />
        );
      })}

      {facilities.map((facility) => (
        <FacilityPin key={facility.id} facility={facility} />
      ))}

      <ContactShadows position={[0, 0, 0]} opacity={0.12} blur={2.6} far={6} scale={30} resolution={512} />
    </Canvas>
  );
}
