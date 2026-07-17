import { FloorHeader } from "../_seatmap-mockups/FloorHeader";
import { FloorFrame } from "../_seatmap-mockups/FloorFrame";
import { SingleSeatStrip } from "../_seatmap-mockups/SingleSeatStrip";
import { makeSingleColumn, makeSingleRow } from "../_seatmap-mockups/podHelpers";

// 4F2B.jpg(제2자유열람실B) 그대로 재현. 총 93석 = 위쪽 벽면 18석(188~205)
// + 좌측 원목 좌석줄 5열(153~187, 8/8/8/6/5석) + 우측 파랑 좌석줄 5열(113~152, 각 8석).
const OCCUPIED = new Set<number>();

const topBar = makeSingleRow(205, 18, OCCUPIED, true);

const leftColumns = [
  makeSingleColumn(187, 8, OCCUPIED, true),
  makeSingleColumn(179, 8, OCCUPIED, true),
  makeSingleColumn(171, 8, OCCUPIED, true),
  makeSingleColumn(163, 6, OCCUPIED, true),
  makeSingleColumn(157, 5, OCCUPIED, true),
];

const rightColumns = [
  makeSingleColumn(152, 8, OCCUPIED, true),
  makeSingleColumn(144, 8, OCCUPIED, true),
  makeSingleColumn(136, 8, OCCUPIED, true),
  makeSingleColumn(128, 8, OCCUPIED, true),
  makeSingleColumn(120, 8, OCCUPIED, true),
];

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F6FF] to-white">
      <FloorHeader title="제2자유열람실B" floorLabel="4F 제2자유열람실B" showAway />
      <FloorFrame>
        <div className="mb-8 flex gap-3">
          <SingleSeatStrip seats={topBar} direction="horizontal" />
        </div>
        <div className="flex items-start gap-6">
          {leftColumns.map((col, i) => (
            <SingleSeatStrip key={`l-${i}`} seats={col} direction="vertical" />
          ))}
          <div className="w-8" />
          {rightColumns.map((col, i) => (
            <SingleSeatStrip key={`r-${i}`} seats={col} direction="vertical" furniture="white" />
          ))}
        </div>
      </FloorFrame>
    </div>
  );
}
