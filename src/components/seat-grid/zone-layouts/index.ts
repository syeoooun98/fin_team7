import { F2F1SeatMap } from "./F2F1SeatMap";
import { F2SQSeatMap } from "./F2SQSeatMap";
import { F4F2SeatMap } from "./F4F2SeatMap";
import type { PublicSeatView, ZoneCode } from "@/lib/types";

export interface ZoneSeatMapProps {
  seats: PublicSeatView[];
  onSeatClick: (seatId: number) => void;
}

/** 실측 사진(2F1A.jpg, 2Fmain.jpg 등)대로 배치를 재현한 구역만 등록한다. 나머지는 기본 그리드. */
export const ZONE_SEAT_MAPS: Partial<Record<ZoneCode, (props: ZoneSeatMapProps) => React.JSX.Element>> = {
  F2F1: F2F1SeatMap,
  F2SQ: F2SQSeatMap,
  F4F2: F4F2SeatMap,
};
