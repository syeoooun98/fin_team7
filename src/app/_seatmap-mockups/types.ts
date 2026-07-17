// 2F1A/2F1B/2Fmain/4F2A/4F2B 참고 사진을 그대로 복제하기 위한 목업 전용 타입.
// 실제 서비스 데이터 모델(src/lib/types.ts)과는 분리된, 화면 재현 전용 목업이다.

export type MockSeatState = "AVAILABLE" | "OCCUPIED" | "AWAY";

export interface MockSeat {
  no: number;
  state: MockSeatState;
}

/** 책상(pill) 하나에 좌우 한 쌍씩 배치되는 좌석 열 (2F1A/2F1B 스타일) */
export interface PairRow {
  left: MockSeat;
  right: MockSeat;
}

/** 좌우 쌍 배치 pod. topRows/bottomRows 두 블록이 위아래로 붙어 하나의 책상 열을 이룬다. */
export interface PodSlot {
  top: PairRow[];
  bottom: PairRow[];
}

/** 단일 좌석이 세로로 쭉 이어지는 열 (2Fmain, 4F2B 좌측, 벽면 부착 좌석줄) */
export type SingleColumn = MockSeat[];
