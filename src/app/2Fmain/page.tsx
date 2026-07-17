import { FloorHeader } from "../_seatmap-mockups/FloorHeader";
import { FloorFrame } from "../_seatmap-mockups/FloorFrame";
import { SingleSeatStrip } from "../_seatmap-mockups/SingleSeatStrip";
import { makeSingleColumn } from "../_seatmap-mockups/podHelpers";

// 2Fmain.jpg(메인 스퀘어) 그대로 재현. 6개 열 × 10석 = 60석, 가운데 넓은 통로로 3열씩 분리.
const OCCUPIED = new Set<number>();

const columns = Array.from({ length: 6 }, (_, i) => makeSingleColumn(i * 10 + 1, 10, OCCUPIED));

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F6FF] to-white">
      <FloorHeader title="메인 스퀘어" floorLabel="2F 메인 스퀘어" showAway />
      <FloorFrame>
        <div className="flex gap-10">
          <div className="flex gap-10">
            {columns.slice(0, 3).map((col, i) => (
              <SingleSeatStrip key={i} seats={col} direction="vertical" />
            ))}
          </div>
          <div className="w-40" />
          <div className="flex gap-10">
            {columns.slice(3, 6).map((col, i) => (
              <SingleSeatStrip key={i} seats={col} direction="vertical" />
            ))}
          </div>
        </div>
      </FloorFrame>
    </div>
  );
}
