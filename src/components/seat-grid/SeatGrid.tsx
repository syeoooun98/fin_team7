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
  /** GS 구역만 전달 — 룸 선택 탭 노출용(DB.md 14.3) */
  roomNumbers?: number[];
  onCheckout: (seatId: number) => void;
  onRequestAway: (seatId: number, categoryCode: AwayCategoryCode) => void;
  onReturnFromAway: (seatId: number) => void;
  onReport: (seatId: number) => Promise<{ accepted: boolean; message: string }>;
  /** TODO(임시): QR 없이 테스트하기 위한 체크인 트리거. 실제 QR 연동 후 제거 */
  onTestCheckIn?: (seatCode: string) => void;
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
  onTestCheckIn,
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
        <label className="ml-auto flex items-center gap-2 text-sm text-neutral-600">
          <input
            type="checkbox"
            checked={outletOnly}
            onChange={(e) => setOutletOnly(e.target.checked)}
          />
          콘센트 있는 좌석만 (F17)
        </label>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
        {visibleSeats.map((seat) => (
          <SeatCell key={seat.id} seat={seat} onClick={() => setSelectedSeatId(seat.id)} />
        ))}
      </div>

      {selectedSeat && (
        <SeatDetailPanel
          open={selectedSeatId !== null}
          onClose={() => setSelectedSeatId(null)}
          seat={selectedSeat}
          ownDetail={ownDetailsBySeatId[selectedSeat.id]}
          onCheckout={() => {
            // 체크아웃 직후에는 상세 패널을 닫는다 — 안 닫으면 방금 비어 AVAILABLE이 된
            // 같은 좌석의 "체크인" 안내가 다시 떠서 마치 재체크인 팝업처럼 보이는 버그가 있었다.
            onCheckout(selectedSeat.id);
            setSelectedSeatId(null);
          }}
          onRequestAway={() => setAwayModalSeatId(selectedSeat.id)}
          onReturnFromAway={() => onReturnFromAway(selectedSeat.id)}
          onOpenReportConfirm={() => {
            // 신고 확인 팝업으로 넘어가는 시점에 상세 패널은 닫는다 — 그래야 신고 팝업이
            // 취소되거나(취소 버튼) 자동으로 닫히거나(완료 후 2초) 했을 때 상세 패널로
            // 돌아가지 않고 곧장 좌석 배치도로 복귀한다.
            setSelectedSeatId(null);
            setReportModalSeatId(selectedSeat.id);
          }}
          onTestCheckIn={
            onTestCheckIn
              ? () => {
                  onTestCheckIn(selectedSeat.seatCode);
                  setSelectedSeatId(null);
                }
              : undefined
          }
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
