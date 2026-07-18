import { makePodSlot, makeSingleColumn, makeSingleRow } from "@/app/_seatmap-mockups/podHelpers";

/**
 * F2F1(제1자유열람실) 실제 좌석 배치 — 2F1A.jpg 참고 사진과 동일한 번호 규칙(podHelpers 참고).
 * 좌석 상태 없이 순수 위치/번호만 뽑아 쓴다 — 실제 상태는 F2F1SeatMap이 API 데이터로 채운다.
 * 총 158석 = 위쪽 벽면 20석(13~32) + 좌측 벽면 12석(1~12) + 7개 pod열(6+3행, 열당 18석).
 */
export const F2F1_TOP_LEFT = makeSingleRow(13, 10).map((s) => s.no);
export const F2F1_TOP_RIGHT = makeSingleRow(23, 10).map((s) => s.no);
export const F2F1_LEFT_COLUMN = makeSingleColumn(12, 12, new Set(), true).map((s) => s.no);
export const F2F1_PODS = Array.from({ length: 7 }, (_, i) => {
  const pod = makePodSlot(33 + i * 18, 6, 3);
  return {
    top: pod.top.map((row) => ({ left: row.left.no, right: row.right.no })),
    bottom: pod.bottom.map((row) => ({ left: row.left.no, right: row.right.no })),
  };
});
