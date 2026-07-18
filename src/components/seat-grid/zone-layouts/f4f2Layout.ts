import { makePodSlot, makeSingleRow } from "@/app/_seatmap-mockups/podHelpers";

/**
 * F4F2(제2자유열람실) 실제 좌석 배치 — 4F2A.jpg 참고 사진과 동일한 번호 규칙.
 * 총 112석 = 위쪽 벽면 18석(95~112) + 좌측 5열(4행, 55~94) + 우측 4열(6행, 7~54)
 * + 우측 끝 짧은 열(3행, 1~6).
 */
export const F4F2_TOP_BAR = makeSingleRow(112, 18, new Set(), true).map((s) => s.no);

function podNumbers(start: number, topRows: number) {
  return makePodSlot(start, topRows, 0).top.map((row) => ({ left: row.left.no, right: row.right.no }));
}

export const F4F2_TAN_PODS = Array.from({ length: 5 }, (_, i) => podNumbers(87 - i * 8, 4));
export const F4F2_BLUE_PODS = Array.from({ length: 4 }, (_, i) => podNumbers(43 - i * 12, 6));
export const F4F2_SHORT_POD = podNumbers(1, 3);
