import { makeSingleColumn } from "@/app/_seatmap-mockups/podHelpers";

/**
 * F2SQ(메인스퀘어) 실제 좌석 배치 — 2Fmain.jpg 참고 사진과 동일한 번호 규칙.
 * 6개 열 × 10석 = 60석, 가운데 넓은 통로로 3열씩 분리.
 */
export const F2SQ_COLUMNS = Array.from({ length: 6 }, (_, i) =>
  makeSingleColumn(i * 10 + 1, 10).map((s) => s.no)
);
