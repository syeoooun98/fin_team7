import { FloorHeader } from "../_seatmap-mockups/FloorHeader";
import { FloorFrame } from "../_seatmap-mockups/FloorFrame";
import { SingleSeatStrip } from "../_seatmap-mockups/SingleSeatStrip";
import { PodColumnPair } from "../_seatmap-mockups/PodColumnPair";
import { makePodSlot, makeSingleRow } from "../_seatmap-mockups/podHelpers";

// 2F1B.jpg(제1자유열람실B) 그대로 재현. 총 132석 = 위쪽 벽면 20석(159~178)
// + 4행 pod 7열(56석) + 4행 pod 7열(56석).
const OCCUPIED = new Set<number>();
const AWAY = new Set<number>([162, 169, 177, 199]);

const topBarLeft = makeSingleRow(159, 10, OCCUPIED, false, AWAY);
const topBarRight = makeSingleRow(169, 10, OCCUPIED, false, AWAY);
const pods = Array.from({ length: 7 }, (_, i) => makePodSlot(179 + i * 16, 4, 4, OCCUPIED, AWAY));

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F6FF] to-white">
      <FloorHeader title="제1자유열람실B" floorLabel="2F 제1자유열람실B" showAway />
      <FloorFrame>
        <div className="mb-8 flex gap-10">
          <SingleSeatStrip seats={topBarLeft} direction="horizontal" />
          <SingleSeatStrip seats={topBarRight} direction="horizontal" />
        </div>
        <div className="flex items-start gap-6">
          {pods.map((pod, i) => (
            <PodColumnPair key={i} pod={pod} furniture="white" />
          ))}
        </div>
      </FloorFrame>
    </div>
  );
}
