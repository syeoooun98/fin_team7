import { FloorHeader } from "../_seatmap-mockups/FloorHeader";
import { FloorFrame } from "../_seatmap-mockups/FloorFrame";
import { SingleSeatStrip } from "../_seatmap-mockups/SingleSeatStrip";
import { PodColumnPair } from "../_seatmap-mockups/PodColumnPair";
import { makePodSlot, makeSingleRow } from "../_seatmap-mockups/podHelpers";

// 4F2A.jpg(제2자유열람실A) 그대로 재현. 총 112석 = 위쪽 벽면 18석(95~112)
// + 좌측 원목 책상 5열(4행, 55~94) + 우측 파랑 책상 4열(6행, 7~54) + 우측 끝 짧은 열(3행, 1~6).
const OCCUPIED = new Set<number>();

const topBar = makeSingleRow(112, 18, OCCUPIED, true);
const tanPods = Array.from({ length: 5 }, (_, i) => makePodSlot(87 - i * 8, 4, 0, OCCUPIED));
const bluePods = Array.from({ length: 4 }, (_, i) => makePodSlot(43 - i * 12, 6, 0, OCCUPIED));
const shortBluePod = makePodSlot(1, 3, 0, OCCUPIED);

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F6FF] to-white">
      <FloorHeader title="제2자유열람실A" floorLabel="4F 제2자유열람실A" showAway />
      <FloorFrame>
        <div className="mb-8 flex gap-3 pl-24">
          <SingleSeatStrip seats={topBar} direction="horizontal" />
        </div>
        <div className="flex items-start gap-6">
          {tanPods.map((pod, i) => (
            <PodColumnPair key={`tan-${i}`} pod={pod} />
          ))}
          <div className="w-8" />
          {bluePods.map((pod, i) => (
            <PodColumnPair key={`blue-${i}`} pod={pod} furniture="white" />
          ))}
          <PodColumnPair pod={shortBluePod} furniture="white" />
        </div>
      </FloorFrame>
    </div>
  );
}
