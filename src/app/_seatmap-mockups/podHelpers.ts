import type { MockSeat, PairRow, PodSlot, SingleColumn } from "./types";

function seat(no: number, occupied: Set<number>, away?: Set<number>): MockSeat {
  const state = away?.has(no) ? "AWAY" : occupied.has(no) ? "OCCUPIED" : "AVAILABLE";
  return { no, state };
}

/**
 * 2F1A/2F1B 사진에서 발견한 번호 규칙을 그대로 재현한다:
 * 한 pod 열은 [start, start+span-1] 범위를 통째로 쓰며,
 * 위쪽 topRows개 행은 왼쪽이 오름차순 / 오른쪽이 그 범위의 끝에서 내림차순으로 채워지고,
 * 아래쪽 bottomRows개 행이 이어서 가운데 남은 번호를 채운다.
 * (예: 2F1A 첫 pod = 33~50, top 6행(33-38 | 50-45), bottom 3행(39-41 | 44-42))
 */
export function makePodSlot(
  start: number,
  topRows: number,
  bottomRows: number,
  occupied: Set<number> = new Set(),
  away: Set<number> = new Set()
): PodSlot {
  const span = topRows * 2 + bottomRows * 2;
  const top: PairRow[] = [];
  for (let i = 0; i < topRows; i++) {
    top.push({
      left: seat(start + i, occupied, away),
      right: seat(start + span - 1 - i, occupied, away),
    });
  }
  const bottom: PairRow[] = [];
  for (let i = 0; i < bottomRows; i++) {
    bottom.push({
      left: seat(start + topRows + i, occupied, away),
      right: seat(start + span - topRows - 1 - i, occupied, away),
    });
  }
  return { top, bottom };
}

/** 단일 좌석 열(세로로 쭉 이어짐). 기본은 오름차순, descending=true면 내림차순으로 번호를 채운다. */
export function makeSingleColumn(
  start: number,
  count: number,
  occupied: Set<number> = new Set(),
  descending = false,
  away: Set<number> = new Set()
): SingleColumn {
  const col: SingleColumn = [];
  for (let i = 0; i < count; i++) {
    col.push(seat(descending ? start - i : start + i, occupied, away));
  }
  return col;
}

/** 벽면에 붙은 가로 좌석 줄(위쪽 벽면 등). 왼쪽→오른쪽으로 번호가 오름차순 또는 내림차순으로 이어진다. */
export function makeSingleRow(
  start: number,
  count: number,
  occupied: Set<number> = new Set(),
  descending = false,
  away: Set<number> = new Set()
): SingleColumn {
  return makeSingleColumn(start, count, occupied, descending, away);
}
