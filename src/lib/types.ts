// 자리지킴이 — 프론트/백엔드 공용 타입
// Prisma 생성 타입을 클라이언트 컴포넌트에서 직접 import하지 않기 위해,
// DB.md 스키마를 그대로 옮긴 순수 TS 타입을 별도로 둔다.

/** 2026-07-17 기준 실제 2~5층 안내도(2F~5F.png) 반영 24개 구역 — DB.md 2.2절 참고. */
export type ZoneCode =
  | "F2F1"
  | "F2SQ"
  | "F2LB"
  | "F2CF"
  | "F2MD"
  | "F2LK"
  | "F2RS"
  | "F2CE"
  | "F3R1"
  | "F3R2"
  | "F3AR"
  | "F3RC"
  | "F3DR"
  | "F3LN"
  | "F3MT"
  | "F3SC"
  | "F4F2"
  | "F4GR"
  | "F4CR"
  | "F4FT"
  | "F4SM"
  | "F4RS"
  | "F5ED"
  | "F5EX";

export type SeatStatus = "AVAILABLE" | "OCCUPIED";

export type CheckoutReason = "MANUAL" | "AWAY_EXPIRED" | "REPORT_EXPIRED";

export type AwayEndReason = "RETURNED" | "AUTO_EXPIRED" | "SESSION_CHECKOUT";

/** CHECKED_OUT: 신고당한 사람이 "자리 복귀 인증" 팝업에서 체크아웃을 선택한 경우 */
export type ReportStatus = "ACTIVE" | "CANCELLED_RETURN" | "AUTO_EXPIRED" | "CHECKED_OUT";

export type AwayCategoryCode = "TOILET" | "CAFE" | "CONVENIENCE" | "MEAL" | "MEETING";

/**
 * DB.md 2.8절 표 + REPORT_CHECKED_OUT(신고 처리 팝업에서 체크아웃 선택 시)
 * + SEAT_WATCH_AVAILABLE("체크아웃 시 알림" 신청 좌석이 실제로 체크아웃됨, F22, DB.md 2.9절)
 */
export type NotificationType =
  | "CHECKIN_COMPLETE"
  | "CHECKOUT_COMPLETE"
  | "AWAY_STARTED"
  | "AWAY_WARNING"
  | "AWAY_AUTO_EXPIRED"
  | "REPORT_RECEIVED"
  | "REPORT_WARNING"
  | "REPORT_AUTO_EXPIRED_OCCUPANT"
  | "REPORT_AUTO_EXPIRED_REPORTER"
  | "REPORT_CANCELLED"
  | "REPORT_CHECKED_OUT"
  | "SEAT_WATCH_AVAILABLE";

export interface Zone {
  code: ZoneCode;
  name: string;
  floor: number;
  colorRef: string;
  description: string | null;
  seatCount: number;
}

export interface AwayCategory {
  code: AwayCategoryCode;
  label: string;
  limitMinutes: number;
  sortOrder: number;
  active: boolean;
}

/**
 * 타인 시점 좌석 뷰 (design.md 4.3/4.4절).
 * 여기 없는 필드(occupant 식별자, away 카테고리, 잔여시간, 신고 여부)는
 * 의도적으로 뺀 것이다 — F7/F9/F14 익명성 요구사항상 API가 애초에 내려주면 안 된다.
 */
export interface PublicSeatView {
  id: number;
  seatCode: string;
  zoneCode: ZoneCode;
  roomNumber: number | null;
  hasOutlet: boolean;
  isWindow: boolean;
  status: SeatStatus;
  /** "외출" 배지 노출 여부만. 카테고리/잔여시간은 절대 포함하지 않는다(F7). */
  isAway: boolean;
  /** 본인 점유 좌석이면 true → self-ring 강조(design.md 2.3) */
  isMine: boolean;
  /**
   * OCCUPIED 좌석에만 존재하는 활성 세션의 내부 id — 체크아웃/자리비움 신청/신고 액션이
   * 대상을 지정하는 데 쓴다. 이 값 자체는 상대방 신원을 특정하지 않는 내부 참조라
   * 노출해도 F14 익명성 원칙에 위배되지 않는다.
   */
  seatSessionId: number | null;
}

/** 본인 시점 좌석 상세. 자리비움 중이면 실제 카테고리/잔여시간까지 노출 가능(F7 "본인에게만"). */
export interface OwnSeatDetail extends PublicSeatView {
  activeAway: {
    /** POST /api/away-periods/[id]/return 대상 id */
    id: number;
    categoryCode: AwayCategoryCode;
    label: string;
    startedAt: string;
    limitMinutes: number;
    remainingSeconds: number;
  } | null;
  /** 본인이 신고당한 경우에만 채워짐. 신고자가 누구인지는 절대 포함하지 않는다(F14). */
  activeReport: {
    countdownEndsAt: string;
    remainingSeconds: number;
  } | null;
  /** F8 쿨다운 — 신청 가능해질 때까지 남은 시간(0이면 신청 가능) */
  awayCooldownRemainingSeconds: number;
}

export interface DashboardZoneSummary {
  zoneCode: ZoneCode;
  zoneName: string;
  floor: number;
  total: number;
  available: number;
  occupied: number;
}

/** 9.3절 대시보드 데이터 항목 */
export interface DashboardSummary {
  total: number;
  available: number;
  occupied: number;
  awayCount: number;
  updatedAt: string;
  byZone: DashboardZoneSummary[];
}

export interface NotificationItem {
  id: number;
  type: NotificationType;
  message: string;
  createdAt: string;
  readAt: string | null;
  /**
   * type이 SEAT_WATCH_AVAILABLE일 때만 채워짐 — "바로 이용하기" 액션이 체크인할 좌석 코드.
   * seat_sessions → seats 조인으로 API가 채워준다(F22).
   */
  seatCode?: string | null;
}
