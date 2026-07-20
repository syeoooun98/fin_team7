import { F2SQ_COLUMNS } from "./f2sqLayout";
import { RealSeatChip } from "./RealSeatChip";
import type { PublicSeatView } from "@/lib/types";

const STRIP = "border-[1.5px] border-[#B7B7C2] bg-white shadow-sm";

function seatNumberOf(seatCode: string) {
  const n = Number(seatCode.split("-").pop());
  return Number.isFinite(n) ? n : null;
}

/** 좌석디자인2.png(메인 스퀘어) 배치를 실제 F2SQ 좌석 데이터로 재현한다. */
export function F2SQSeatMap({
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
          <div className="flex gap-10">
            <div className="flex gap-10">
              {F2SQ_COLUMNS.slice(0, 3).map((col, i) => (
                <div key={i} className={`flex flex-col gap-1.5 rounded-full px-1.5 py-1.5 ${STRIP}`}>
                  {col.map(chip)}
                </div>
              ))}
            </div>
            <div className="w-40" />
            <div className="flex gap-10">
              {F2SQ_COLUMNS.slice(3, 6).map((col, i) => (
                <div key={i} className={`flex flex-col gap-1.5 rounded-full px-1.5 py-1.5 ${STRIP}`}>
                  {col.map(chip)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
