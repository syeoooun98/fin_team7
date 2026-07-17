// 자리지킴이 — 개발 중 화면 확인용 목업 데이터
// TODO: 실제 DB 연동(Prisma, prisma/schema.prisma) 후 각 페이지의 이 import를
// lib/db.ts 기반 쿼리 또는 /api/* 라우트 호출로 교체한다. 지금은 구조/화면만 먼저 동작시킨다.
import type {
  AwayCategory,
  DashboardSummary,
  DashboardZoneSummary,
  NotificationItem,
  OwnSeatDetail,
  PublicSeatView,
  ZoneCode,
} from "./types";

interface ZoneMeta {
  code: ZoneCode;
  name: string;
  floor: number;
  seatCount: number;
}

const ZONE_META: ZoneMeta[] = [
  { code: "CZ", name: "캐주얼 라운지 존", floor: 1, seatCount: 30 },
  { code: "QA", name: "조용한 열람실 A", floor: 2, seatCount: 60 },
  { code: "QB", name: "조용한 열람실 B", floor: 2, seatCount: 60 },
  { code: "LZ", name: "노트북 존", floor: 2, seatCount: 40 },
  { code: "OH", name: "오픈 열람홀", floor: 3, seatCount: 80 },
  { code: "GS", name: "그룹 스터디룸", floor: 3, seatCount: 40 },
];

export const MOCK_AWAY_CATEGORIES: AwayCategory[] = [
  { code: "TOILET", label: "화장실", limitMinutes: 10, sortOrder: 1, active: true },
  { code: "CAFE", label: "카페", limitMinutes: 20, sortOrder: 2, active: true },
  { code: "CONVENIENCE", label: "편의점", limitMinutes: 20, sortOrder: 3, active: true },
  { code: "MEAL", label: "식사", limitMinutes: 60, sortOrder: 4, active: true },
  { code: "MEETING", label: "회의", limitMinutes: 90, sortOrder: 5, active: true },
];

function padSeatNumber(n: number) {
  return String(n).padStart(3, "0");
}

/** 데모용 결정적(비-랜덤) 상태 분배 — 인덱스를 5로 나눈 나머지로 상태를 순환시킨다 */
function statusForIndex(i: number): { status: PublicSeatView["status"]; isAway: boolean } {
  const cycle = i % 5;
  if (cycle === 0) return { status: "AVAILABLE", isAway: false };
  if (cycle === 1) return { status: "EMPTY", isAway: false };
  if (cycle === 2) return { status: "OCCUPIED", isAway: false };
  if (cycle === 3) return { status: "OCCUPIED", isAway: true };
  return { status: "AVAILABLE", isAway: false };
}

export function buildMockSeatsForZone(zoneCode: ZoneCode): PublicSeatView[] {
  const meta = ZONE_META.find((z) => z.code === zoneCode);
  if (!meta) return [];

  if (zoneCode === "GS") {
    const seats: PublicSeatView[] = [];
    let idx = 0;
    for (let room = 1; room <= 10; room++) {
      for (let seat = 1; seat <= 4; seat++) {
        const { status, isAway } = statusForIndex(idx);
        seats.push({
          id: idx + 1,
          seatCode: `GS-${String(room).padStart(2, "0")}-${seat}`,
          zoneCode,
          roomNumber: room,
          hasOutlet: false,
          isWindow: false,
          status,
          isAway,
          isMine: idx === 2, // 데모: 3번째 좌석을 "내 좌석"으로 표시
        });
        idx++;
      }
    }
    return seats;
  }

  return Array.from({ length: meta.seatCount }, (_, i) => {
    const { status, isAway } = statusForIndex(i);
    return {
      id: i + 1,
      seatCode: `${zoneCode}-${padSeatNumber(i + 1)}`,
      zoneCode,
      roomNumber: null,
      hasOutlet: zoneCode === "LZ",
      isWindow: zoneCode === "OH" && i % 7 === 0,
      status,
      isAway,
      isMine: i === 2, // 데모: 3번째 좌석을 "내 좌석"으로 표시
    };
  });
}

export function buildMockDashboardSummary(): DashboardSummary {
  const byZone: DashboardZoneSummary[] = ZONE_META.map((meta) => {
    const seats = buildMockSeatsForZone(meta.code);
    const available = seats.filter((s) => s.status === "AVAILABLE").length;
    const empty = seats.filter((s) => s.status === "EMPTY").length;
    const occupied = seats.filter((s) => s.status === "OCCUPIED").length;
    return {
      zoneCode: meta.code,
      zoneName: meta.name,
      floor: meta.floor,
      total: seats.length,
      available,
      empty,
      occupied,
    };
  });

  return {
    total: byZone.reduce((sum, z) => sum + z.total, 0),
    available: byZone.reduce((sum, z) => sum + z.available, 0),
    empty: byZone.reduce((sum, z) => sum + z.empty, 0),
    occupied: byZone.reduce((sum, z) => sum + z.occupied, 0),
    awayCount: byZone.reduce((sum, z) => sum + z.occupied, 0) / 2,
    updatedAt: "방금",
    byZone,
  };
}

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: 1, type: "CHECKIN_COMPLETE", message: "CZ-003 좌석에 체크인했습니다.", createdAt: "10분 전", readAt: null },
  { id: 2, type: "AWAY_STARTED", message: "카페(20분) 자리비움을 시작했습니다.", createdAt: "8분 전", readAt: "8분 전" },
  { id: 3, type: "AWAY_WARNING", message: "자리비움 잔여 4분 — 곧 자동 반납됩니다.", createdAt: "4분 전", readAt: null },
];

export const MOCK_MY_SEAT: OwnSeatDetail = {
  id: 3,
  seatCode: "CZ-003",
  zoneCode: "CZ",
  roomNumber: null,
  hasOutlet: false,
  isWindow: false,
  status: "OCCUPIED",
  isAway: true,
  isMine: true,
  activeAway: {
    categoryCode: "CAFE",
    label: "카페",
    startedAt: new Date(Date.now() - 16 * 60_000).toISOString(),
    limitMinutes: 20,
    remainingSeconds: 4 * 60,
  },
  activeReport: null,
  awayCooldownRemainingSeconds: 0,
};
