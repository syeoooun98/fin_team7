// 자리지킴이 — design.md 2절 컬러 토큰 및 PRD 확정 상수값
import type { AwayCategoryCode, SeatStatus, ZoneCode } from "./types";

/** design.md 2.1 — 구역 식별 색. 좌석 상태 색과 절대 섞어 쓰지 않는다(맵 레벨 전용). */
// 파스텔 네온 톤(채도를 낮춘 밝은 톤이지만 선명하게 도드라지는 형광 계열) 24개 확정값.
export const ZONE_COLORS: Record<ZoneCode, { token: string; hex: string }> = {
  F2F1: { token: "zone-mint-neon", hex: "#7CF5C4" },
  F2SQ: { token: "zone-sky-neon", hex: "#6FE3F5" },
  F2LB: { token: "zone-lavender", hex: "#C7B9FF" },
  F2CF: { token: "zone-periwinkle", hex: "#9DB4FF" },
  F2MD: { token: "zone-violet-neon", hex: "#D9A6FF" },
  F2LK: { token: "zone-peach", hex: "#FFC98C" },
  F2RS: { token: "zone-lemon", hex: "#FDE68A" },
  F2CE: { token: "zone-salmon", hex: "#FF9EAE" },
  F3R1: { token: "zone-turquoise", hex: "#5EEAD4" },
  F3R2: { token: "zone-baby-blue", hex: "#8FC1FF" },
  F3AR: { token: "zone-light-green", hex: "#9BF6C4" },
  F3RC: { token: "zone-fuchsia-neon", hex: "#F3A8FF" },
  F3DR: { token: "zone-rose", hex: "#FFA6B8" },
  F3LN: { token: "zone-lime", hex: "#C6F76B" },
  F3MT: { token: "zone-tangerine", hex: "#FFBE7B" },
  F3SC: { token: "zone-indigo-lavender", hex: "#B4B8FF" },
  F4F2: { token: "zone-aqua-neon", hex: "#6FE9E1" },
  F4GR: { token: "zone-purple", hex: "#C9AEFF" },
  F4CR: { token: "zone-yellow-neon", hex: "#FCE96A" },
  F4FT: { token: "zone-hot-pink", hex: "#FFA8D8" },
  F4SM: { token: "zone-green-neon", hex: "#93F7A8" },
  F4RS: { token: "zone-coral", hex: "#FFAFAF" },
  F5ED: { token: "zone-sky-blue", hex: "#83D9FF" },
  F5EX: { token: "zone-magenta-violet", hex: "#E29CFF" },
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

/**
 * 마이페이지 외출 태그별 통계 도넛 차트 색상 — dataviz 스킬 카테고리 팔레트 슬롯 1~5(blue/
 * green/magenta/yellow/aqua)를 away_categories.sort_order 순서 그대로 고정 배정한 것.
 * `node scripts/validate_palette.js`로 라이트/다크 모드 둘 다 검증 통과(CVD ΔE ≥8, 대비 WARN은
 * 직접 라벨/범례 병행으로 완화 — 차트 컴포넌트에서 항상 라벨을 같이 그린다).
 */
export const AWAY_CATEGORY_CHART_COLORS: Record<AwayCategoryCode, { light: string; dark: string }> = {
  TOILET: { light: "#2a78d6", dark: "#3987e5" },
  CAFE: { light: "#008300", dark: "#008300" },
  CONVENIENCE: { light: "#e87ba4", dark: "#d55181" },
  MEAL: { light: "#eda100", dark: "#c98500" },
  MEETING: { light: "#1baf7a", dark: "#199e70" },
};

/** PRD 10.3 — 자리비움/신고 공통 경고 시점 공식: 잔여시간이 전체 허용시간의 20%일 때 */
export const WARNING_THRESHOLD_RATIO = 0.2;

/** PRD F8/10.4 — 자리비움 재신청 쿨다운 */
export const AWAY_COOLDOWN_MINUTES = 30;

/** PRD F10/F12 — 신고 카운트다운 */
export const REPORT_COUNTDOWN_MINUTES = 60;

/**
 * 신고 종결(자리 복귀 처리 또는 체크아웃) 후 같은 좌석을 다시 신고할 수 없는 최소 간격.
 * 좌석 단위 쿨다운 — 종결된 세션이 그대로 남아있든(자리 복귀) 새 세션으로 바뀌었든(재이용) 적용.
 */
export const REPORT_RECOOLDOWN_MINUTES = 10;

/** DB.md 14.6 — 감사 로그(신고자-피신고자 매핑) 보관 기간, 이후 익명화 배치 대상 */
export const AUDIT_LOG_RETENTION_DAYS = 90;
