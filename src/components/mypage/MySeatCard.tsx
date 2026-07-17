import { AwayCountdown } from "@/components/away/AwayCountdown";
import { Button } from "@/components/ui/Button";
import type { OwnSeatDetail } from "@/lib/types";

/** design.md 4.7 — 마이페이지 내 현재 좌석 카드. 자리비움/신고 카운트다운을 실시간으로 보여준다(F18). */
export function MySeatCard({
  seat,
  onCheckout,
  onReturnFromAway,
  onReturnFromReport,
}: {
  seat: OwnSeatDetail | null;
  onCheckout: () => void;
  onReturnFromAway: () => void;
  onReturnFromReport: () => void;
}) {
  if (!seat) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-500">
        현재 체크인한 좌석이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 p-4">
      <p className="font-semibold">{seat.seatCode}</p>

      {seat.activeAway && (
        <AwayCountdown
          categoryLabel={seat.activeAway.label}
          limitMinutes={seat.activeAway.limitMinutes}
          remainingSeconds={seat.activeAway.remainingSeconds}
          onReturn={onReturnFromAway}
        />
      )}

      {seat.activeReport && (
        <div className="space-y-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          <p>
            누군가 이 좌석의 장시간 부재를 신고했습니다. 60분 내 복귀하지 않으면 자동
            반납됩니다. (신고자 정보는 제공되지 않습니다, F14)
          </p>
          <Button variant="secondary" onClick={onReturnFromReport}>
            자리 복귀
          </Button>
        </div>
      )}

      {!seat.activeAway && (
        <Button variant="secondary" onClick={onCheckout}>
          체크아웃
        </Button>
      )}
    </div>
  );
}
