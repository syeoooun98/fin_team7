import { F2F1_LEFT_COLUMN, F2F1_PODS, F2F1_TOP_LEFT, F2F1_TOP_RIGHT } from "./f2f1Layout";
import { RealSeatChip } from "./RealSeatChip";
import type { PublicSeatView } from "@/lib/types";

const STRIP = "border-[1.5px] border-[#B7B7C2] bg-white shadow-sm";

function seatNumberOf(seatCode: string) {
  const n = Number(seatCode.split("-").pop());
  return Number.isFinite(n) ? n : null;
}

/** 좌석디자인1.png(제1자유열람실A) 배치를 실제 F2F1 좌석 데이터로 재현한다. */
export function F2F1SeatMap({
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

  return (
    <div className="space-y-2">
      <p className="text-xs text-foreground-muted sm:hidden">
        두 손가락으로 확대한 뒤 좌석을 눌러주세요. 좌우로 밀어서 전체를 볼 수 있어요.
      </p>
      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(124,58,237,0.06)]">
        <div className="rounded-xl bg-[#FAFAFC] p-8" style={{ minWidth: "1100px" }}>
          <div className="mb-8 flex gap-10 pl-32">
            <div className={`flex gap-1.5 rounded-full px-1.5 py-1.5 ${STRIP}`}>{F2F1_TOP_LEFT.map(chip)}</div>
            <div className={`flex gap-1.5 rounded-full px-1.5 py-1.5 ${STRIP}`}>{F2F1_TOP_RIGHT.map(chip)}</div>
          </div>
          <div className="flex items-start gap-6">
            <div className={`flex flex-col gap-1.5 rounded-full px-1.5 py-1.5 ${STRIP}`}>
              {F2F1_LEFT_COLUMN.map(chip)}
            </div>
            <div className="flex flex-col gap-3">
              <div className="h-[168px] w-[54px] rounded-full border border-gray-200 bg-white shadow-sm" />
              <div className="h-[92px] w-[54px] rounded-full border border-gray-200 bg-white shadow-sm" />
            </div>
            {F2F1_PODS.map((pod, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className={`flex flex-col gap-1.5 rounded-full px-1.5 py-2 ${STRIP}`}>
                  {pod.top.map((row, r) => (
                    <div key={r} className="flex items-center gap-3">
                      {chip(row.left)}
                      {chip(row.right)}
                    </div>
                  ))}
                </div>
                <div className={`flex flex-col gap-1.5 rounded-full px-1.5 py-2 ${STRIP}`}>
                  {pod.bottom.map((row, r) => (
                    <div key={r} className="flex items-center gap-3">
                      {chip(row.left)}
                      {chip(row.right)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
