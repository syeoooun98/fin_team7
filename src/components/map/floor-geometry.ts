// 자리지킴이 — floor-plans.ts의 % 배치를 실제 3D 좌표(m)로 변환하는 순수 함수 모음.
// 축척 가정: 1 unit = 1m. floor-plans.ts에는 절대 치수가 없어(실측 도면에서 상대 위치/비율만
// 추출한 데이터) 건물 전체 가로/세로 폭을 임의로 가정했다. 실제 치수가 확정되면
// FOOTPRINT_WIDTH/FOOTPRINT_DEPTH만 조정하면 전체 지오메트리가 비율을 유지한 채 스케일된다.
import type { FloorPlanBlock } from "@/lib/floor-plans";

/** 층고 가정치 (일반적인 도서관 열람실 층고 범위 2.4~2.7m 중간값) */
export const WALL_HEIGHT = 2.6;
/** 벽 두께 가정치 */
export const WALL_THICKNESS = 0.18;
/** 바닥 슬래브 두께 */
export const FLOOR_THICKNESS = 0.12;
/** 바닥/벽 모서리 라운드 반경 — 각 박스의 최소 변 길이를 넘지 않도록 RoomMesh에서 clamp해서 쓴다. */
export const FLOOR_CORNER_RADIUS = 0.045;
export const WALL_CORNER_RADIUS = 0.07;
/** 건물 전체 가로 폭(m) 가정치 — floor-plans.ts % 좌표계의 기준 */
export const FOOTPRINT_WIDTH = 18;
/** 건물 전체 세로 깊이(m) 가정치 */
export const FOOTPRINT_DEPTH = 11;

export interface WallSegment {
  x: number;
  z: number;
  /** x축 방향 크기 */
  sizeX: number;
  /** z축 방향 크기 */
  sizeZ: number;
}

export interface RoomGeometry {
  centerX: number;
  centerZ: number;
  width: number;
  depth: number;
  floorWidth: number;
  floorDepth: number;
}

/** block의 %기반 left/top/width/height를 건물 중심 기준 미터 좌표로 변환한다. */
export function computeRoomGeometry(block: FloorPlanBlock): RoomGeometry {
  const x0 = (block.left / 100) * FOOTPRINT_WIDTH - FOOTPRINT_WIDTH / 2;
  const z0 = (block.top / 100) * FOOTPRINT_DEPTH - FOOTPRINT_DEPTH / 2;
  const width = (block.width / 100) * FOOTPRINT_WIDTH;
  const depth = (block.height / 100) * FOOTPRINT_DEPTH;
  const centerX = x0 + width / 2;
  const centerZ = z0 + depth / 2;

  return {
    centerX,
    centerZ,
    width,
    depth,
    // 벽 두께의 절반만큼 안쪽으로 들여서, 벽 중심선이 방 경계선과 정확히 겹치게 한다
    // (computeFloorWalls가 그리는 벽과 바닥 사이에 틈/겹침이 생기지 않도록).
    floorWidth: Math.max(0.4, width - WALL_THICKNESS),
    floorDepth: Math.max(0.4, depth - WALL_THICKNESS),
  };
}

/** 시설 아이콘(화장실/엘리베이터/비상구계단)의 %기반 점 좌표를 미터 좌표로 변환한다. */
export function computeFacilityPosition(left: number, top: number): { x: number; z: number } {
  return {
    x: (left / 100) * FOOTPRINT_WIDTH - FOOTPRINT_WIDTH / 2,
    z: (top / 100) * FOOTPRINT_DEPTH - FOOTPRINT_DEPTH / 2,
  };
}

interface AxisEdge {
  /** 벽이 놓일 고정 축 좌표(가로 벽이면 z, 세로 벽이면 x) */
  pos: number;
  /** 벽이 뻗는 방향의 [시작, 끝] 구간(가로 벽이면 x구간, 세로 벽이면 z구간) */
  span: [number, number];
}

const MERGE_EPSILON = 0.02;

function mergeSpans(spans: [number, number][]): [number, number][] {
  const sorted = [...spans].sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const [start, end] of sorted) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1] + MERGE_EPSILON) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  }
  return merged;
}

/**
 * 층 전체 블록을 한 번에 훑어서 벽 경계선을 만든다.
 * 기존에는 방마다 자기 벽 4면을 각자(자기 경계 안쪽으로 들여서) 그렸는데, 그러면 맞닿은 두 방
 * 사이마다 반투명 흰 벽이 거의 겹치도록 두 겹으로 그려져(카메라 시선이 두 벽을 연달아 통과) 실제보다
 * 어둡게/회색으로 보이는 문제가 있었다. 여기서는 같은 경계선(축 좌표+구간)을 공유하는 벽을 하나로
 * 합쳐, 방 경계당 벽이 정확히 한 겹만 그려지게 한다.
 */
export function computeFloorWalls(blocks: FloorPlanBlock[]): WallSegment[] {
  const horizontal = new Map<string, AxisEdge[]>(); // z 고정, x로 뻗는 벽(북/남)
  const vertical = new Map<string, AxisEdge[]>(); // x 고정, z로 뻗는 벽(서/동)

  for (const block of blocks) {
    const x0 = (block.left / 100) * FOOTPRINT_WIDTH - FOOTPRINT_WIDTH / 2;
    const z0 = (block.top / 100) * FOOTPRINT_DEPTH - FOOTPRINT_DEPTH / 2;
    const x1 = x0 + (block.width / 100) * FOOTPRINT_WIDTH;
    const z1 = z0 + (block.height / 100) * FOOTPRINT_DEPTH;

    for (const z of [z0, z1]) {
      const key = z.toFixed(2);
      const list = horizontal.get(key) ?? [];
      list.push({ pos: z, span: [x0, x1] });
      horizontal.set(key, list);
    }
    for (const x of [x0, x1]) {
      const key = x.toFixed(2);
      const list = vertical.get(key) ?? [];
      list.push({ pos: x, span: [z0, z1] });
      vertical.set(key, list);
    }
  }

  const walls: WallSegment[] = [];

  for (const edges of horizontal.values()) {
    const pos = edges[0].pos;
    for (const [start, end] of mergeSpans(edges.map((e) => e.span))) {
      if (end - start < 0.05) continue;
      walls.push({ x: (start + end) / 2, z: pos, sizeX: end - start, sizeZ: WALL_THICKNESS });
    }
  }
  for (const edges of vertical.values()) {
    const pos = edges[0].pos;
    for (const [start, end] of mergeSpans(edges.map((e) => e.span))) {
      if (end - start < 0.05) continue;
      walls.push({ x: pos, z: (start + end) / 2, sizeX: WALL_THICKNESS, sizeZ: end - start });
    }
  }

  return walls;
}
