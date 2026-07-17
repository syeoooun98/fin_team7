import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { AwayCountdown } from "@/components/away/AwayCountdown";
import type { OwnSeatDetail, PublicSeatView } from "@/lib/types";

interface SeatDetailPanelProps {
  open: boolean;
  onClose: () => void;
  seat: PublicSeatView;
  /** 본인 점유 좌석(seat.isMine === true)일 때만 채워짐 */
  ownDetail?: OwnSeatDetail;
  onCheckout: () => void;
  onRequestAway: () => void;
  onReturnFromAway: () => void;
  /** 실제 신고 처리는 하지 않는다 — 확인 모달(ReportConfirmModal)을 여는 것까지만(design.md 4.6) */
  onOpenReportConfirm: () => void;
}

/**
 * design.md 4.4 — 좌석 상세 패널.
 * "좌석 상태 × 점유 주체(본인/타인/없음)" 조합별로 노출 액션이 완전히 다르다는 표를 그대로 분기한다.
 * 타인의 외출 좌석(design.md 4.4 표 5행)은 의도적으로 액션 자체를 렌더링하지 않는다(F7).
 */
export function SeatDetailPanel({
  open,
  onClose,
  seat,
  ownDetail,
  onCheckout,
  onRequestAway,
  onReturnFromAway,
  onOpenReportConfirm,
}: SeatDetailPanelProps) {
  return (
    <Modal open={open} onClose={onClose} title={seat.seatCode}>
      <div className="space-y-3 text-sm text-neutral-700">
        {(seat.status === "AVAILABLE" || seat.status === "EMPTY") && (
          <p>이 자리에 부착된 QR 코드를 폰으로 스캔해 체크인하세요. (현장 체크인만 지원, PRD 2.3)</p>
        )}

        {seat.status === "OCCUPIED" && seat.isMine && !seat.isAway && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onCheckout}>
              체크아웃
            </Button>
            <Button onClick={onRequestAway}>자리 비움</Button>
          </div>
        )}

        {seat.status === "OCCUPIED" && seat.isMine && seat.isAway && ownDetail?.activeAway && (
          <AwayCountdown
            categoryLabel={ownDetail.activeAway.label}
            limitMinutes={ownDetail.activeAway.limitMinutes}
            remainingSeconds={ownDetail.activeAway.remainingSeconds}
            onReturn={onReturnFromAway}
          />
        )}

        {seat.status === "OCCUPIED" && seat.isMine && ownDetail?.activeReport && (
          <p className="rounded-lg bg-amber-50 p-3 text-amber-900">
            누군가 이 좌석의 장시간 부재를 신고했습니다. 60분 내 복귀하지 않으면 자동
            반납됩니다. (신고자 정보는 제공되지 않습니다)
          </p>
        )}

        {seat.status === "OCCUPIED" && !seat.isMine && !seat.isAway && (
          <Button variant="danger" onClick={onOpenReportConfirm}>
            신고하기
          </Button>
        )}

        {seat.status === "OCCUPIED" && !seat.isMine && seat.isAway && (
          <p className="text-neutral-500">외출 중인 좌석입니다. (카테고리·잔여시간은 비공개, F7)</p>
        )}
      </div>
    </Modal>
  );
}
