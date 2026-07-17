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

/**
 * 2026-07-17 실제 2~5층 방 이름 기준(1차) → 2026-07-17(2차) 더 상세한 2F~5F.png 반영해 24개 구역으로 확장.
 * 실제 Supabase DB의 zones 테이블과 동일(DB.md 2.2절). seatCount는 전부 0 — 실제 좌석 수가
 * 아직 미정(TBD)이라 임의로 채우지 않았다. 실측 좌석 수가 확정되면 이 값과 아래
 * buildMockSeatsForZone의 length를 함께 갱신할 것.
 */
export const ZONE_META: ZoneMeta[] = [
  { code: "F2F1", name: "제1자유열람실", floor: 2, seatCount: 0 },
  { code: "F2SQ", name: "메인스퀘어", floor: 2, seatCount: 0 },
  { code: "F2LB", name: "메인로비", floor: 2, seatCount: 0 },
  { code: "F2CF", name: "컨퍼런스룸", floor: 2, seatCount: 0 },
  { code: "F2MD", name: "미디어실", floor: 2, seatCount: 0 },
  { code: "F2LK", name: "락커룸", floor: 2, seatCount: 0 },
  { code: "F2RS", name: "휴게실", floor: 2, seatCount: 0 },
  { code: "F2CE", name: "카페", floor: 2, seatCount: 0 },
  { code: "F3R1", name: "제1자료실", floor: 3, seatCount: 0 },
  { code: "F3R2", name: "제2자료실", floor: 3, seatCount: 0 },
  { code: "F3AR", name: "수서/정리실", floor: 3, seatCount: 0 },
  { code: "F3RC", name: "학술정보운영팀(리서치커먼스)", floor: 3, seatCount: 0 },
  { code: "F3DR", name: "도서관장실", floor: 3, seatCount: 0 },
  { code: "F3LN", name: "대출실", floor: 3, seatCount: 0 },
  { code: "F3MT", name: "회의실", floor: 3, seatCount: 0 },
  { code: "F3SC", name: "악보서가", floor: 3, seatCount: 0 },
  { code: "F4F2", name: "제2자유열람실", floor: 4, seatCount: 0 },
  { code: "F4GR", name: "대학원 열람실", floor: 4, seatCount: 0 },
  { code: "F4CR", name: "1인 연구 캐럴", floor: 4, seatCount: 0 },
  { code: "F4FT", name: "미래인재양성센터", floor: 4, seatCount: 0 },
  { code: "F4SM", name: "대학원세미나실", floor: 4, seatCount: 0 },
  { code: "F4RS", name: "휴게실", floor: 4, seatCount: 0 },
  { code: "F5ED", name: "학술정보이용교육실", floor: 5, seatCount: 0 },
  { code: "F5EX", name: "고시반", floor: 5, seatCount: 0 },
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

/** 데모용 결정적(비-랜덤) 상태 분배 — 인덱스를 3으로 나눈 나머지로 상태를 순환시킨다 */
function statusForIndex(i: number): { status: PublicSeatView["status"]; isAway: boolean } {
  const cycle = i % 3;
  if (cycle === 0) return { status: "AVAILABLE", isAway: false };
  if (cycle === 1) return { status: "OCCUPIED", isAway: false };
  return { status: "OCCUPIED", isAway: true };
}

/**
 * 구역만 확정되고 실제 좌석 배치는 아직 없어서(seatCount 0) 항상 빈 배열을 반환한다.
 * 현재 24개 구역 중 room_number 기반 그룹핑(구 GS 방식)이 필요한 곳은 없다 — 향후 그런
 * 구역이 추가되면 room_number를 채워 넣는 분기를 여기 다시 추가하면 된다.
 */
export function buildMockSeatsForZone(zoneCode: ZoneCode): PublicSeatView[] {
  const meta = ZONE_META.find((z) => z.code === zoneCode);
  if (!meta) return [];

  return Array.from({ length: meta.seatCount }, (_, i) => {
    const { status, isAway } = statusForIndex(i);
    return {
      id: i + 1,
      seatCode: `${zoneCode}-${padSeatNumber(i + 1)}`,
      zoneCode,
      roomNumber: null,
      hasOutlet: false,
      isWindow: false,
      status,
      isAway,
      isMine: i === 2, // 데모: 3번째 좌석을 "내 좌석"으로 표시
      seatSessionId: null, // 목업 좌석이라 실제 세션이 없음
    };
  });
}

export function buildMockDashboardSummary(): DashboardSummary {
  const byZone: DashboardZoneSummary[] = ZONE_META.map((meta) => {
    const seats = buildMockSeatsForZone(meta.code);
    const available = seats.filter((s) => s.status === "AVAILABLE").length;
    const occupied = seats.filter((s) => s.status === "OCCUPIED").length;
    return {
      zoneCode: meta.code,
      zoneName: meta.name,
      floor: meta.floor,
      total: seats.length,
      available,
      occupied,
    };
  });

  return {
    total: byZone.reduce((sum, z) => sum + z.total, 0),
    available: byZone.reduce((sum, z) => sum + z.available, 0),
    occupied: byZone.reduce((sum, z) => sum + z.occupied, 0),
    awayCount: byZone.reduce((sum, z) => sum + z.occupied, 0) / 2,
    updatedAt: "방금",
    byZone,
  };
}

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: 1, type: "CHECKIN_COMPLETE", message: "F2F1-003 좌석에 체크인했습니다.", createdAt: "10분 전", readAt: null },
  { id: 2, type: "AWAY_STARTED", message: "카페(20분) 자리비움을 시작했습니다.", createdAt: "8분 전", readAt: "8분 전" },
  { id: 3, type: "AWAY_WARNING", message: "자리비움 잔여 4분 — 곧 자동 반납됩니다.", createdAt: "4분 전", readAt: null },
];

export const MOCK_MY_SEAT: OwnSeatDetail = {
  id: 3,
  seatCode: "F2F1-003",
  zoneCode: "F2F1",
  roomNumber: null,
  hasOutlet: false,
  isWindow: false,
  status: "OCCUPIED",
  isAway: true,
  isMine: true,
  seatSessionId: null, // 목업 데이터라 실제 세션이 없음
  activeAway: {
    id: 1,
    categoryCode: "CAFE",
    label: "카페",
    startedAt: new Date(Date.now() - 16 * 60_000).toISOString(),
    limitMinutes: 20,
    remainingSeconds: 4 * 60,
  },
  activeReport: null,
  awayCooldownRemainingSeconds: 0,
};
