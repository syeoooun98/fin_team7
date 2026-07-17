import { FloorHeader } from "../_seatmap-mockups/FloorHeader";
import { FloorFrame } from "../_seatmap-mockups/FloorFrame";
import { SingleSeatStrip } from "../_seatmap-mockups/SingleSeatStrip";
import { PodColumnPair } from "../_seatmap-mockups/PodColumnPair";
import { makePodSlot, makeSingleColumn, makeSingleRow } from "../_seatmap-mockups/podHelpers";

// 2F1A.jpg(제1자유열람실A) 그대로 재현. 총 158석 = 위쪽 벽면 20석(13~32) + 좌측 벽면 12석(1~12)
// + 6행 pod 7열(84석) + 3행 pod 7열(42석).
const OCCUPIED = new Set<number>();

const topBarLeft = makeSingleRow(13, 10, OCCUPIED);
const topBarRight = makeSingleRow(23, 10, OCCUPIED);
const leftColumn = makeSingleColumn(12, 12, OCCUPIED, true);
const pods = Array.from({ length: 7 }, (_, i) => makePodSlot(33 + i * 18, 6, 3, OCCUPIED));

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F6FF] to-white">
      <FloorHeader title="제1자유열람실A" floorLabel="2F 제1자유열람실A" showAway />
      <FloorFrame>
        <div className="mb-8 flex gap-10 pl-32">
          <SingleSeatStrip seats={topBarLeft} direction="horizontal" />
          <SingleSeatStrip seats={topBarRight} direction="horizontal" />
        </div>
        <div className="flex items-start gap-6">
          <SingleSeatStrip seats={leftColumn} direction="vertical" />
          <div className="flex flex-col gap-3">
            <div className="h-[168px] w-[54px] rounded-full border border-gray-200 bg-white shadow-sm" />
            <div className="h-[92px] w-[54px] rounded-full border border-gray-200 bg-white shadow-sm" />
          </div>
          {pods.map((pod, i) => (
            <PodColumnPair key={i} pod={pod} furniture="white" />
          ))}
        </div>
      </FloorFrame>
    </div>
  );
}
