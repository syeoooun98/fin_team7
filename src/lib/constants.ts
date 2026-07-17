// 자리지킴이 — design.md 2절 컬러 토큰 및 PRD 확정 상수값
import type { AwayCategoryCode, SeatStatus, ZoneCode } from "./types";

/**
 * design.md 2.1 — 구역 식별 색. 좌석 상태 색과 절대 섞어 쓰지 않는다(맵 레벨 전용).
 * 2026-07-17: 실제 Supabase DB의 zones.color_ref 값과 1:1 매핑되도록 교체(PRD 6.2).
 */
export const ZONE_COLORS: Record<ZoneCode, { token: string; hex: string }> = {
  F2F1: { token: "zone-coral", hex: "#FF7A5C" },
  F2LB: { token: "zone-slate", hex: "#64748B" },
  F2SQ: { token: "zone-teal", hex: "#2BB3A3" },
  F3R1: { token: "zone-blue", hex: "#4C8DFF" },
  F3R2: { token: "zone-navy", hex: "#2C3E7A" },
  F4CR: { token: "zone-yellow", hex: "#F5B942" },
  F4F2: { token: "zone-green", hex: "#4CAF6D" },
  F4FT: { token: "zone-pink", hex: "#EC4899" },
  F4GR: { token: "zone-purple", hex: "#A855F7" },
  // 기능 테스트용 임시 구역 — 실제 구역 색상표가 아님
  TEST: { token: "zone-coral", hex: "#FF7A5C" },
};

/** design.md 2.2 — 좌석 상태 색 (전 구역 공통, 2단계: 예약가능/이용중 + 이용중 하위 외출 배지). 색 + 아이콘 + 라벨 3중 표현 원칙 필수. */
export const SEAT_STATUS_STYLE: Record<
  SeatStatus,
  { token: string; bg: string; border: string; label: string }
> = {
  AVAILABLE: { token: "seat-available", bg: "#EAF7EE", border: "#2E9E52", label: "예약 가능" },
  OCCUPIED: { token: "seat-occupied", bg: "#F1F1F3", border: "#6B7280", label: "이용중" },
};

/** design.md 4.3 — "이용중-외출" 배지. 카테고리/잔여시간은 이 스타일 객체에 절대 넣지 않는다(F7). */
export const AWAY_BADGE_STYLE = { bg: "#F1F1F3", border: "#6B7280", label: "외출" };

/** design.md 2.3 — 시맨틱 색 */
export const SEMANTIC_COLORS = {
  warnAmber: "#F5A623",
  neutralInfo: "#6B7280",
  dangerMuted: "#D9534F",
  selfRing: "#7C3AED",
};

/** PRD 10.2 — 자리비움 카테고리별 제한시간(분). 실제 값은 서버(away_categories 테이블)가 원천이며, 이건 UI 낙관적 렌더링/폴백용. */
export const AWAY_CATEGORY_LIMIT_MINUTES: Record<AwayCategoryCode, number> = {
  TOILET: 10,
  CAFE: 20,
  CONVENIENCE: 20,
  MEAL: 60,
  MEETING: 90,
};

/** PRD 10.3 — 자리비움/신고 공통 경고 시점 공식: 잔여시간이 전체 허용시간의 20%일 때 */
export const WARNING_THRESHOLD_RATIO = 0.2;

/** PRD F8/10.4 — 자리비움 재신청 쿨다운 */
export const AWAY_COOLDOWN_MINUTES = 30;

/** PRD F10/F12 — 신고 카운트다운 */
export const REPORT_COUNTDOWN_MINUTES = 60;

/** DB.md 14.6 — 감사 로그(신고자-피신고자 매핑) 보관 기간, 이후 익명화 배치 대상 */
export const AUDIT_LOG_RETENTION_DAYS = 90;
