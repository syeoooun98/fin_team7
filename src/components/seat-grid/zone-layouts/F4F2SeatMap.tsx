import { F4F2_BLUE_PODS, F4F2_SHORT_POD, F4F2_TAN_PODS, F4F2_TOP_BAR } from "./f4f2Layout";
import { RealSeatChip } from "./RealSeatChip";
import type { PublicSeatView } from "@/lib/types";

const STRIP = "border-[1.5px] border-[#B7B7C2] bg-white shadow-sm";

function seatNumberOf(seatCode: string) {
  const n = Number(seatCode.split("-").pop());
  return Number.isFinite(n) ? n : null;
}

/** 좌석디자인3.png(제2자유열람실, 4F2A.jpg) 배치를 실제 F4F2 좌석 데이터로 재현한다. */
export function F4F2SeatMap({
  seats,
  onSeatClick,
}: {
  seats: PublicSeatView[];
  onSeatClick: (seatId: number) => void;
}) {
  const byNumber = new Map<number, PublicSeatView>();
  for (const seat of seats) {
    const no = seatNumberOf(seat.seatCode);
    if (no !== null) byNumber.set(no, seat);
  }

  const chip = (no: number) => {
    const seat = byNumber.get(no);
    return (
      <RealSeatChip key={no} no={no} seat={seat} onClick={seat ? () => onSeatClick(seat.id) : undefined} />
    );
  };

  const podColumn = (pod: { left: number; right: number }[], key: string) => (
    <div key={key} className={`flex flex-col gap-1.5 rounded-full px-1.5 py-2 ${STRIP}`}>
      {pod.map((row, r) => (
        <div key={r} className="flex items-center gap-3">
          {chip(row.left)}
          {chip(row.right)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-2">
      <p className="text-xs text-foreground-muted sm:hidden">
        두 손가락으로 확대한 뒤 좌석을 눌러주세요. 좌우로 밀어서 전체를 볼 수 있어요.
      </p>
      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(124,58,237,0.06)]">
        <div className="rounded-xl bg-[#FAFAFC] p-8" style={{ minWidth: "1300px" }}>
          <div className="mb-8 flex gap-3 pl-24">
            <div className={`flex gap-1.5 rounded-full px-1.5 py-1.5 ${STRIP}`}>{F4F2_TOP_BAR.map(chip)}</div>
          </div>
          <div className="flex items-start gap-6">
            {F4F2_TAN_PODS.map((pod, i) => podColumn(pod, `tan-${i}`))}
            <div className="w-8" />
            {F4F2_BLUE_PODS.map((pod, i) => podColumn(pod, `blue-${i}`))}
            {podColumn(F4F2_SHORT_POD, "short")}
          </div>
        </div>
      </div>
    </div>
  );
}
