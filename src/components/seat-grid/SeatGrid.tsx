"use client";

import { useMemo, useState } from "react";
import { SeatCell } from "./SeatCell";
import { SeatDetailPanel } from "./SeatDetailPanel";
import { GroupStudyRoomSelector } from "./GroupStudyRoomSelector";
import { AwayRequestModal } from "@/components/away/AwayRequestModal";
import { ReportConfirmModal } from "@/components/report/ReportConfirmModal";
import type { AwayCategory, AwayCategoryCode, OwnSeatDetail, PublicSeatView } from "@/lib/types";

interface SeatGridProps {
  seats: PublicSeatView[];
  /** seat.id -> 본인 상세 (본인 점유 좌석에만 존재) */
  ownDetailsBySeatId: Record<number, OwnSeatDetail>;
  awayCategories: AwayCategory[];
  /** 룸 단위로 나뉜 구역에서만 전달 — 룸 선택 탭 노출용(DB.md 14.3) */
  roomNumbers?: number[];
  onCheckout: (seatId: number) => void;
  onRequestAway: (seatId: number, categoryCode: AwayCategoryCode) => void;
  onReturnFromAway: (seatId: number) => void;
  onReport: (seatId: number) => Promise<{ accepted: boolean; message: string }>;
}

/** design.md 4.3 — 구역 좌석 그리드 팝업. F17 필터, GS 룸 선택, 좌석 상세 진입을 오케스트레이션한다. */
export function SeatGrid({
  seats,
  ownDetailsBySeatId,
  awayCategories,
  roomNumbers,
  onCheckout,
  onRequestAway,
  onReturnFromAway,
  onReport,
}: SeatGridProps) {
  const [outletOnly, setOutletOnly] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(roomNumbers?.[0] ?? null);
  const [selectedSeatId, setSelectedSeatId] = useState<number | null>(null);
  const [awayModalSeatId, setAwayModalSeatId] = useState<number | null>(null);
  const [reportModalSeatId, setReportModalSeatId] = useState<number | null>(null);

  const visibleSeats = useMemo(() => {
    return seats
      .filter((s) => !outletOnly || s.hasOutlet)
      .filter((s) => selectedRoom === null || s.roomNumber === selectedRoom);
  }, [seats, outletOnly, selectedRoom]);

  const selectedSeat = seats.find((s) => s.id === selectedSeatId) ?? null;
  const awayModalCooldown =
    (selectedSeatId && ownDetailsBySeatId[selectedSeatId]?.awayCooldownRemainingSeconds) ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {roomNumbers && roomNumbers.length > 0 && selectedRoom !== null && (
          <GroupStudyRoomSelector
            roomNumbers={roomNumbers}
            selectedRoom={selectedRoom}
            onSelect={setSelectedRoom}
          />
        )}
        <label className="ml-auto flex items-center gap-2 rounded-full border border-border-subtle bg-white px-3 py-1.5 text-sm text-foreground-muted shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <input
            type="checkbox"
            checked={outletOnly}
            onChange={(e) => setOutletOnly(e.target.checked)}
            className="accent-brand"
          />
          콘센트 있는 좌석만 (F17)
        </label>
      </div>

      {seats.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border-strong bg-white/60 p-8 text-center text-sm text-foreground-muted">
          아직 좌석 데이터가 등록되지 않은 구역입니다.
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6 md:grid-cols-8">
          {visibleSeats.map((seat) => (
            <SeatCell key={seat.id} seat={seat} onClick={() => setSelectedSeatId(seat.id)} />
          ))}
        </div>
      )}

      {selectedSeat && (
        <SeatDetailPanel
          open={selectedSeatId !== null}
          onClose={() => setSelectedSeatId(null)}
          seat={selectedSeat}
          ownDetail={ownDetailsBySeatId[selectedSeat.id]}
          onCheckout={() => onCheckout(selectedSeat.id)}
          onRequestAway={() => setAwayModalSeatId(selectedSeat.id)}
          onReturnFromAway={() => onReturnFromAway(selectedSeat.id)}
          onOpenReportConfirm={() => setReportModalSeatId(selectedSeat.id)}
        />
      )}

      <AwayRequestModal
        open={awayModalSeatId !== null}
        onClose={() => setAwayModalSeatId(null)}
        categories={awayCategories}
        cooldownRemainingSeconds={awayModalCooldown}
        onSelectCategory={(categoryCode) => {
          if (awayModalSeatId !== null) onRequestAway(awayModalSeatId, categoryCode);
          setAwayModalSeatId(null);
        }}
      />

      <ReportConfirmModal
        open={reportModalSeatId !== null}
        onClose={() => setReportModalSeatId(null)}
        onSubmit={() => (reportModalSeatId !== null ? onReport(reportModalSeatId) : Promise.resolve({ accepted: false, message: "" }))}
      />
    </div>
  );
}
