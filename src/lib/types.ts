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

/** DB.md 2.8절 표 + REPORT_CHECKED_OUT(신고 처리 팝업에서 체크아웃 선택 시) */
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
  | "REPORT_CHECKED_OUT";

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
  /**
   * 점유자가 장착한 배지(아이콘+제목만) — 학번/이름 등 신원 정보는 절대 포함하지 않는다(F14).
   * 장착한 배지가 없거나 좌석이 비어있으면 null.
   */
  occupantBadge: { code: BadgeCode; icon: string; title: string } | null;
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
}

/** 마이페이지 외출 태그별 통계(주/월) 한 카테고리 분 */
export interface AwayStatsCategory {
  code: AwayCategoryCode;
  label: string;
  /** 해당 기간 내 완료된(체크아웃/자동반납/정상복귀 등으로 끝난) 자리비움 횟수 */
  count: number;
  /** 실제 사용 시간 합(분) — 신청 시 부여된 제한시간이 아니라 startedAt~endedAt 실측치 */
  totalMinutes: number;
}

export interface AwayStats {
  range: "week" | "month";
  /** 집계 시작 시각(주: 이번 주 월요일 0시, 월: 이번 달 1일 0시) */
  rangeStart: string;
  categories: AwayStatsCategory[];
}

/** 마이페이지 일별 자리비움 시간 선그래프(최근 7일) 한 점 */
export interface AwayDailyPoint {
  /** YYYY-MM-DD (서버 로컬 기준 하루 단위) */
  date: string;
  totalMinutes: number;
}

export interface AwayDailyStats {
  days: AwayDailyPoint[];
}

/** 마이페이지 배지/칭호 6종 — 기준은 lib/badges.ts 참고 */
export type BadgeCode =
  | "LIBRARY_REGULAR"
  | "PRECISE_RETURN_MASTER"
  | "JUSTICE_SHERIFF"
  | "GONE_WITH_THE_WIND"
  | "WEEKLY_CERT_STAR"
  | "COMMUNITY_GUARDIAN";

export interface BadgeStatus {
  code: BadgeCode;
  title: string;
  description: string;
  /** 이모지 아이콘 — 별도 에셋 파이프라인 없이 표시 */
  icon: string;
  /** true면 불명예 칭호(바람과 함께 사라지다) */
  dishonor: boolean;
  earned: boolean;
  /** 최초 획득 시각. 미획득이면 null */
  awardedAt: string | null;
}

export type CommunitySort = "recent" | "likes" | "comments";

/**
 * 커뮤니티 게시글 카드 뷰. authorBadge는 장착한 배지의 아이콘+제목만 — 학번/이름은 절대
 * 포함하지 않는다(F14 연장 적용). photoUrl은 항상 만료 있는 signed URL이다.
 */
export interface CommunityPostSummary {
  id: number;
  photoUrl: string;
  authorBadge: { code: BadgeCode; icon: string; title: string } | null;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  isMine: boolean;
}

export interface CommunityComment {
  id: number;
  authorBadge: { code: BadgeCode; icon: string; title: string } | null;
  content: string;
  createdAt: string;
  isMine: boolean;
}
