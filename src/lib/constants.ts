// 자리지킴이 — design.md 2절 컬러 토큰 및 PRD 확정 상수값
import type { AwayCategoryCode, SeatStatus, ZoneCode } from "./types";

/** design.md 2.1 — 구역 식별 색. 좌석 상태 색과 절대 섞어 쓰지 않는다(맵 레벨 전용). */
export const ZONE_COLORS: Record<ZoneCode, { token: string; hex: string }> = {
  CZ: { token: "zone-coral", hex: "#FF7A5C" },
  QA: { token: "zone-blue", hex: "#4C8DFF" },
  QB: { token: "zone-navy", hex: "#2C3E7A" },
  LZ: { token: "zone-yellow", hex: "#F5B942" },
  OH: { token: "zone-teal", hex: "#2BB3A3" },
  GS: { token: "zone-green", hex: "#4CAF6D" },
};

/** design.md 2.2 — 좌석 상태 색 (전 구역 공통). 색 + 아이콘 + 라벨 3중 표현 원칙 필수. */
export const SEAT_STATUS_STYLE: Record<
  SeatStatus,
  { token: string; bg: string; border: string; label: string }
> = {
  AVAILABLE: { token: "seat-available", bg: "#EAF7EE", border: "#2E9E52", label: "가능" },
  EMPTY: { token: "seat-empty", bg: "#E8F1FF", border: "#3B7DDB", label: "방금 비었어요" },
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

/** PRD 7.1 — "빈자리 → 예약가능" buffer. DB.md 14.4: 파일럿 검증 전이라 확정치 아님(TBD). */
export const EMPTY_TO_AVAILABLE_BUFFER_MINUTES = 5;

/** PRD 10.3 — 자리비움/신고 공통 경고 시점 공식: 잔여시간이 전체 허용시간의 20%일 때 */
export const WARNING_THRESHOLD_RATIO = 0.2;

/** PRD F8/10.4 — 자리비움 재신청 쿨다운 */
export const AWAY_COOLDOWN_MINUTES = 30;

/** PRD F10/F12 — 신고 카운트다운 */
export const REPORT_COUNTDOWN_MINUTES = 60;

/** DB.md 14.6 — 감사 로그(신고자-피신고자 매핑) 보관 기간, 이후 익명화 배치 대상 */
export const AUDIT_LOG_RETENTION_DAYS = 90;
