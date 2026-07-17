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
  /**
   * TODO(임시): PRD 2.3상 체크인은 QR 스캔 전용이라 원래 앱 내 버튼이 없어야 한다.
   * 물리 QR/스캐너가 준비되기 전까지 기능 테스트를 위해서만 제공하는 트리거 — 제공되면
   * "테스트" 라벨이 붙은 버튼을 노출한다. QR 연동 후 이 prop과 버튼을 제거할 것.
   */
  onTestCheckIn?: () => void;
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
  onTestCheckIn,
}: SeatDetailPanelProps) {
  return (
    <Modal open={open} onClose={onClose} title={seat.seatCode}>
      <div className="space-y-3 text-sm text-foreground-muted">
        {seat.status === "OCCUPIED" && seat.occupantBadge && (
          <p className="flex items-center gap-1.5 text-xs text-foreground-subtle">
            <span className="text-base">{seat.occupantBadge.icon}</span>
            {seat.isMine ? "내가 장착한 칭호" : "이 자리 이용자의 칭호"}: {seat.occupantBadge.title}
          </p>
        )}

        {seat.status === "AVAILABLE" && (
          <div className="space-y-2">
            <p className="rounded-xl border border-border-subtle bg-surface-soft p-3 leading-relaxed">
              이 자리에 부착된 QR 코드를 폰으로 스캔해 체크인하세요. (현장 체크인만 지원, PRD 2.3)
            </p>
            {onTestCheckIn && (
              <Button variant="secondary" onClick={onTestCheckIn}>
                체크인 (테스트용, QR 없이)
              </Button>
            )}
          </div>
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
            startedAt={ownDetail.activeAway.startedAt}
            onReturn={onReturnFromAway}
          />
        )}

        {seat.status === "OCCUPIED" && seat.isMine && ownDetail?.activeReport && (
          <p className="rounded-xl border border-warn-amber/30 bg-amber-50 p-3 text-amber-900">
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
          <p className="rounded-xl border border-border-subtle bg-surface-soft p-3 text-foreground-muted">
            외출 중인 좌석입니다. (카테고리·잔여시간은 비공개, F7)
          </p>
        )}
      </div>
    </Modal>
  );
}
